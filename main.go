package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/gorilla/mux"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"sigs.k8s.io/yaml"
)

var (
	resourceData = sync.Map{}
	dynClient    dynamic.Interface
	initCounter  int32
	allowedOrigins = []string{"http://localhost:3000", "https://example.com"} // Configure allowed domains here
)   

func main() {
	_, clientset, err := initializeClients()
	if err != nil {
		log.Printf("Client initialization failed: %v", err)
		log.Printf("Starting server without Kubernetes functionality.")
		// Continue with limited functionality
	} else {
		// Initialize resource data only if connection is successful
		// Get the list of all API resources available
		discoveryClient := clientset.Discovery()
		serverResources, err := discoveryClient.ServerPreferredResources()
		if err != nil {
			log.Printf("Failed to retrieve server preferred resources: %v", err)
			log.Printf("Starting server with limited Kubernetes functionality.")
		} else {
			// Initialize resource data asynchronously
			initializeResourceDataAsync(serverResources)
		}
	}

	// Set up HTTP routes using Gorilla Mux
	r := mux.NewRouter()
	r.HandleFunc("/", mainPageHandler).Methods("GET")
	r.HandleFunc("/list/{resourceType}", resourceListHandler).Methods("GET")
	r.HandleFunc("/details/{resourceType}/{name}", resourceDetailHandler).Methods("GET")

	r.Use(enableCors)

	fmt.Println("Server started at http://localhost:8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func initializeClients() (*rest.Config, *kubernetes.Clientset, error) {
	// Load Kubernetes configuration
	loadingRules := clientcmd.NewDefaultClientConfigLoadingRules()
	configOverrides := &clientcmd.ConfigOverrides{}
	kubeconfig := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(loadingRules, configOverrides)

	config, err := kubeconfig.ClientConfig()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to load Kubernetes configuration: %v", err)
	}

	// Create a Dynamic Client
	dynClient, err = dynamic.NewForConfig(config)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create dynamic client: %v", err)
	}

	// Create a Kubernetes Clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create Kubernetes clientset: %v", err)
	}

	return config, clientset, nil
}

func initializeResourceDataAsync(serverResources []*metav1.APIResourceList) {
	var wg sync.WaitGroup

	for _, resourceList := range serverResources {
		for _, resource := range resourceList.APIResources {
			if shouldSkipResource(resource) {
				continue
			}

			wg.Add(1)
			go func(resourceList *metav1.APIResourceList, resource metav1.APIResource) {
				defer wg.Done()

				gvr := schema.GroupVersionResource{
					Group:    resourceList.GroupVersion,
					Version:  resource.Version,
					Resource: resource.Name,
				}

				if gvr.Group == "v1" {
					gvr.Version = gvr.Group
					gvr.Group = ""
				}

				// List the resources
				list, err := dynClient.Resource(gvr).Namespace(metav1.NamespaceAll).List(context.TODO(), metav1.ListOptions{})
				if err != nil {
					log.Printf("Warning: Unable to list resources for %s: %v", gvr.Resource, err)
					return
				}

				// Store resources in memory
				for _, item := range list.Items {
					resourceKey := fmt.Sprintf("%s/%s", gvr.Resource, item.GetName())
					resourceData.Store(resourceKey, &item)
				}

				atomic.AddInt32(&initCounter, 1)
				log.Printf("Initialized resource %s/%s (%d/%d)", gvr.Group, gvr.Resource, initCounter, len(serverResources))
			}(resourceList, resource)
		}
	}

	wg.Wait()
	log.Printf("All resources initialized.")
}

func shouldSkipResource(resource metav1.APIResource) bool {
	return containsSlash(resource.Name) || !resource.Namespaced
}

// mainPageHandler serves the list of all resource types in JSON
func mainPageHandler(w http.ResponseWriter, r *http.Request) {
	resourceTypes := make(map[string]bool)
	resourceData.Range(func(key, value interface{}) bool {
		resourceKey := strings.Split(key.(string), "/")[0]
		resourceTypes[resourceKey] = true
		return true
	})

	resourceTypeList := make([]string, 0, len(resourceTypes))
	for resourceType := range resourceTypes {
		resourceTypeList = append(resourceTypeList, resourceType)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resourceTypeList)
}

// resourceListHandler serves the list of resources for a specific type in JSON
func resourceListHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceType := vars["resourceType"]

	resourceNames := make([]string, 0)
	resourceData.Range(func(key, value interface{}) bool {
		parts := strings.Split(key.(string), "/")
		if parts[0] == resourceType {
			resourceNames = append(resourceNames, parts[1])
		}
		return true
	})

	if len(resourceNames) == 0 {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resourceNames)
}

// resourceDetailHandler serves the details of a specific resource in JSON or YAML
func resourceDetailHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	resourceType := vars["resourceType"]
	name := vars["name"]

	resourceKey := fmt.Sprintf("%s/%s", resourceType, name)
	value, exists := resourceData.Load(resourceKey)
	if !exists {
		http.NotFound(w, r)
		return
	}

	resource := value.(*unstructured.Unstructured)

	// Check if YAML is requested through query parameter
	if r.URL.Query().Get("format") == "yaml" {
		// Remove managedFields section
		unstructured.RemoveNestedField(resource.Object, "metadata", "managedFields")

		// Convert to YAML
		resourceYAML, err := yaml.Marshal(resource.Object)
		if err != nil {
			http.Error(w, "Error converting to YAML", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "text/yaml")
		w.Write(resourceYAML)
		return
	}

	// Otherwise, return JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resource.Object)
}

// containsSlash checks if a string contains a slash, indicating it's a subresource
func containsSlash(s string) bool {
	return len(s) > 0 && s[0] == '/'
}

func enableCors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests (OPTIONS method)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

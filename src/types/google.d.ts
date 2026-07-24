// Global type definitions for Google Identity Services (GIS)
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (notification?: any) => void
          renderButton: (parent: HTMLElement, options: any) => void
          cancel: () => void
        }
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: {
              access_token?: string
              error?: string
              error_description?: string
              expires_in?: number
              scope?: string
              token_type?: string
            }) => void
            error_callback?: (error: any) => void
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void
          }
        }
      }
    }
  }
}

export {}

class ClipboardManager {
    constructor() {
        this.fallbackTextArea = null;
    }

    async copyToClipboard(text) {
        try {
            // Modern Clipboard API (preferred method)
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return { success: true, method: 'clipboard-api' };
            }
            
            // Fallback for older browsers or non-HTTPS contexts
            return this.fallbackCopyToClipboard(text);
            
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            
            // Try fallback method if modern API fails
            try {
                return this.fallbackCopyToClipboard(text);
            } catch (fallbackError) {
                console.error('Fallback copy also failed:', fallbackError);
                return { 
                    success: false, 
                    error: 'Unable to copy to clipboard. Please copy manually.',
                    method: 'failed'
                };
            }
        }
    }

    fallbackCopyToClipboard(text) {
        // Create a temporary textarea element
        this.fallbackTextArea = document.createElement('textarea');
        this.fallbackTextArea.value = text;
        this.fallbackTextArea.style.position = 'fixed';
        this.fallbackTextArea.style.left = '-9999px';
        this.fallbackTextArea.style.top = '-9999px';
        
        document.body.appendChild(this.fallbackTextArea);
        
        // Select and copy the text
        this.fallbackTextArea.focus();
        this.fallbackTextArea.select();
        this.fallbackTextArea.setSelectionRange(0, 99999); // For mobile devices
        
        const successful = document.execCommand('copy');
        
        // Clean up
        document.body.removeChild(this.fallbackTextArea);
        this.fallbackTextArea = null;
        
        if (successful) {
            return { success: true, method: 'execCommand' };
        } else {
            throw new Error('execCommand copy failed');
        }
    }

    // Check if clipboard functionality is available
    isClipboardSupported() {
        return !!(
            (navigator.clipboard && window.isSecureContext) || 
            document.queryCommandSupported('copy')
        );
    }

    // Get clipboard permissions status
    async getClipboardPermissions() {
        if (!navigator.permissions) {
            return 'unknown';
        }

        try {
            const permission = await navigator.permissions.query({ name: 'clipboard-write' });
            return permission.state; // 'granted', 'denied', or 'prompt'
        } catch (error) {
            console.warn('Could not check clipboard permissions:', error);
            return 'unknown';
        }
    }
}

// Utility function for showing copy feedback
function showCopyFeedback(element, success, message = null) {
    element.classList.remove('success', 'error');
    
    if (success) {
        element.classList.add('success');
        element.textContent = message || '✅ Copied successfully!';
    } else {
        element.classList.add('error');
        element.textContent = message || '❌ Failed to copy';
    }
    
    element.style.opacity = '1';
    
    // Hide feedback after 3 seconds
    setTimeout(() => {
        element.style.opacity = '0';
    }, 3000);
}

// Initialize clipboard manager
const clipboardManager = new ClipboardManager();
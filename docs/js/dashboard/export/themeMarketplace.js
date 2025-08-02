/**
 * themeMarketplace.js
 * 
 * This module implements the Theme Marketplace functionality, allowing users to browse,
 * install, and activate themes from the marketplace.
 */

import ThemeValidator from './themeValidationSchema.js';
import { ScalableThemeSystem } from './themeSystem.js';
// Use global ThemeRegistry and ThemeLoader objects instead of importing them directly
// This helps avoid module resolution issues

class ThemeMarketplace {
  constructor() {
    this.validator = new ThemeValidator();
    
    // Initialize theme registry - check for different possible theme systems
    if (window.themeSystem instanceof ScalableThemeSystem) {
      // Use existing ScalableThemeSystem instance if available
      console.log('Using existing ScalableThemeSystem instance');
      this.themeRegistry = window.themeSystem;
    } else if (ScalableThemeSystem) {
      // Create new ScalableThemeSystem if class is available
      console.log('Creating new ScalableThemeSystem instance');
      window.themeSystem = new ScalableThemeSystem();
      this.themeRegistry = window.themeSystem;
    } else if (window.ThemeRegistry) {
      // Fall back to legacy ThemeRegistry
      console.log('Using legacy ThemeRegistry');
      this.themeRegistry = new window.ThemeRegistry();
    } else {
      // Create a minimal mock object as last resort
      console.warn('No theme system found, using mock object');
      this.themeRegistry = { 
        themes: new Map(),
        registerTheme: (id, config) => console.log(`Mock registered theme: ${id}`),
        switchTheme: (id) => console.log(`Mock switched to theme: ${id}`)
      };
    }
    
    // Initialize theme loader
    this.themeLoader = window.ThemeLoader ? new window.ThemeLoader() : {
      loadTheme: (id, cssFiles) => Promise.resolve(console.log(`Mock loaded theme: ${id}`))
    };
    
    this.installedThemes = new Map(); // Map of installed themes (id -> theme config)
    this.marketplaceThemes = new Map(); // Map of available marketplace themes (id -> theme metadata)
    this.apiEndpoint = 'https://api.example.com/themes'; // Replace with actual API endpoint
    this.localStorageKey = 'installed_themes';
    
    // Load installed themes from local storage
    this._loadInstalledThemes();
  }

  /**
   * Initialize the marketplace UI
   */
  async initMarketplace() {
    // Get marketplace container
    const marketplaceContainer = document.getElementById('marketplace-themes-container');
    if (!marketplaceContainer) {
      console.error('Marketplace container not found');
      return;
    }

    // Clear any existing content
    marketplaceContainer.innerHTML = '';
    
    // Show loading indicator
    marketplaceContainer.innerHTML = '<div class="loading-indicator">Loading marketplace themes...</div>';
    
    try {
      // Fetch themes from marketplace
      await this.fetchMarketplaceThemes();
      
      // Clear loading indicator
      marketplaceContainer.innerHTML = '';
      
      // If no themes found, show message
      if (this.marketplaceThemes.size === 0) {
        marketplaceContainer.innerHTML = '<div class="no-themes-message">No themes available in the marketplace</div>';
        return;
      }
      
      // Render marketplace themes
      this.renderMarketplaceThemes(marketplaceContainer);
      
      // Add event listeners
      this._setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize marketplace:', error);
      marketplaceContainer.innerHTML = `<div class="error-message">Failed to load marketplace themes: ${error.message}</div>`;
    }
  }

  /**
   * Fetch available themes from the marketplace API
   */
  async fetchMarketplaceThemes() {
    // For demo purposes, we'll use mock data
    // In production, this would be an API call
    
    // Clear existing marketplace themes
    this.marketplaceThemes.clear();
    
    // Initialize mock themes
    this._initMockThemes();
    
    // In a real implementation, this would be:
    // try {
    //   const response = await fetch(this.apiEndpoint);
    //   if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    //   const themes = await response.json();
    //   
    //   themes.forEach(theme => {
    //     theme.installed = this.isThemeInstalled(theme.id);
    //     this.marketplaceThemes.set(theme.id, theme);
    //   });
    // } catch (error) {
    //   console.error('Failed to fetch marketplace themes:', error);
    //   throw error;
    // }
  }
  
  /**
   * Initialize mock themes for the marketplace
   * @private
   */
  _initMockThemes() {
    // Create mock marketplace themes
    const mockThemes = [
      {
        id: 'theme-enterprise',
        name: 'Enterprise',
        description: 'A professional theme designed for enterprise risk reports',
        version: '1.0.0',
        author: {
          name: 'AI Risk Framework Team',
          email: 'support@airiskframework.com'
        },
        license: 'MIT',
        category: 'premium',
        tags: ['enterprise', 'professional', 'dark'],
        previewImage: 'themes/enterprise/preview.png',
        pricing: {
          price: 49.99,
          currency: 'USD',
          type: 'one-time'
        },
        installed: false
      },
      {
        id: 'theme-minimalist',
        name: 'Minimalist',
        description: 'A clean, minimalist theme focusing on content readability',
        version: '1.0.0',
        author: {
          name: 'AI Risk Framework Team',
          email: 'support@airiskframework.com'
        },
        license: 'MIT',
        category: 'free',
        tags: ['minimalist', 'clean', 'light'],
        previewImage: 'themes/minimalist/preview.png',
        installed: false
      },
      {
        id: 'theme-technical',
        name: 'Technical',
        description: 'Designed for technical audiences with code-friendly styling',
        version: '1.0.0',
        author: {
          name: 'AI Risk Framework Team',
          email: 'support@airiskframework.com'
        },
        license: 'MIT',
        category: 'premium',
        tags: ['technical', 'code', 'dark'],
        previewImage: 'themes/technical/preview.png',
        pricing: {
          price: 29.99,
          currency: 'USD',
          type: 'one-time'
        },
        installed: false
      },
      {
        id: 'theme-colorful',
        name: 'Colorful',
        description: 'A vibrant theme with colorful accents for engaging reports',
        version: '1.0.0',
        author: {
          name: 'Community Contributor',
          email: 'contributor@example.com'
        },
        license: 'MIT',
        category: 'community',
        tags: ['colorful', 'vibrant', 'light'],
        previewImage: 'themes/colorful/preview.png',
        installed: false
      },
      // Migrated built-in themes
      {
        id: 'theme-professional',
        name: 'Professional',
        description: 'Clean, corporate design with blue accents and professional typography',
        version: '1.0.0',
        author: {
          name: 'AI Risk Pro Team',
          email: 'support@airiskpro.com'
        },
        license: 'MIT',
        category: 'free',
        tags: ['corporate', 'clean', 'print-ready'],
        previewImage: 'themes/professional/preview.png',
        installed: true
      },
      {
        id: 'theme-executive',
        name: 'Executive',
        description: 'Sophisticated dark blue and gold design for high-level presentations',
        version: '1.0.0',
        author: {
          name: 'AI Risk Pro Team',
          email: 'support@airiskpro.com'
        },
        license: 'MIT',
        category: 'free',
        tags: ['sophisticated', 'premium-look', 'executive'],
        previewImage: 'themes/executive/preview.png',
        installed: true
      },
      {
        id: 'theme-modern',
        name: 'Modern',
        description: 'Vibrant purple and teal design with gradients and modern effects',
        version: '1.0.0',
        author: {
          name: 'AI Risk Pro Team',
          email: 'support@airiskpro.com'
        },
        license: 'MIT',
        category: 'free',
        tags: ['vibrant', 'gradients', 'modern'],
        previewImage: 'themes/modern/preview.png',
        installed: true
      },
      {
        id: 'theme-default',
        name: 'Default',
        description: 'Classic blue and gray design for a clean and professional look',
        version: '1.0.0',
        author: {
          name: 'AI Risk Pro Team',
          email: 'support@airiskpro.com'
        },
        license: 'MIT',
        category: 'free',
        tags: ['classic', 'clean', 'professional'],
        previewImage: 'themes/default/preview.png',
        installed: true
      },
      {
        id: 'theme-dark',
        name: 'Dark',
        description: 'Elegant dark mode with purple accents and glowing effects',
        version: '1.0.0',
        author: {
          name: 'AI Risk Pro Team',
          email: 'support@airiskpro.com'
        },
        license: 'MIT',
        category: 'free',
        tags: ['dark-mode', 'glowing', 'technical'],
        previewImage: 'themes/dark/preview.png',
        installed: true
      }
    ];
    
    // Process each mock theme
    mockThemes.forEach(theme => {
      // Check if theme is already installed via localStorage
      if (!theme.installed) {
        theme.installed = this.isThemeInstalled(theme.id);
      }
      
      // If theme is marked as installed, make sure it's properly registered
      if (theme.installed) {
        // Create theme configuration for installation if not already in installedThemes
        if (!this.installedThemes.has(theme.id)) {
          const themeConfig = {
            id: theme.id,
            name: theme.name,
            description: theme.description,
            version: theme.version,
            author: theme.author,
            cssFiles: [
              `themes/${theme.id}/base.css`,
              `themes/${theme.id}/layout.css`,
              `themes/${theme.id}/colors.css`,
              `themes/${theme.id}/main.css`
            ]
          };
          
          // Add to installed themes map
          this.installedThemes.set(theme.id, themeConfig);
          
          // Register with ThemeRegistry or ScalableThemeSystem if it exists
          if (this.themeRegistry) {
            if (typeof this.themeRegistry.registerTheme === 'function') {
              // For both ThemeRegistry and ScalableThemeSystem
              console.log(`Registering theme ${themeConfig.id} with theme system`);
              this.themeRegistry.registerTheme(themeConfig.id, themeConfig);
            } else if (typeof this.themeRegistry.themes !== 'undefined' && typeof this.themeRegistry.themes.set === 'function') {
              // Fallback for mock registry
              console.log(`Adding theme ${themeConfig.id} to mock registry`);
              this.themeRegistry.themes.set(themeConfig.id, themeConfig);
            }
          }
        }
      }
      
      // Add to marketplace themes map
      this.marketplaceThemes.set(theme.id, theme);
    });
    
    // Save installed themes to localStorage
    this._saveInstalledThemes();
  }

  /**
   * Render marketplace themes in the provided container
   * @param {HTMLElement} container - The container to render themes in
   */
  renderMarketplaceThemes(container) {
    // Create filter controls
    const filterControls = document.createElement('div');
    filterControls.className = 'marketplace-filters';
    filterControls.innerHTML = `
      <div class="filter-group">
        <label>Category:</label>
        <select id="filter-category">
          <option value="all">All Categories</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="community">Community</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Sort by:</label>
        <select id="filter-sort">
          <option value="name">Name</option>
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
        </select>
      </div>
      <div class="filter-group">
        <input type="text" id="filter-search" placeholder="Search themes...">
      </div>
    `;
    container.appendChild(filterControls);
    
    // Create themes grid
    const themesGrid = document.createElement('div');
    themesGrid.className = 'marketplace-themes-grid';
    container.appendChild(themesGrid);
    
    // Render each theme
    this.marketplaceThemes.forEach(theme => {
      const themeCard = this._createThemeCard(theme);
      themesGrid.appendChild(themeCard);
    });
  }

  /**
   * Create a theme card element for the marketplace
   * @param {Object} theme - The theme metadata
   * @returns {HTMLElement} The theme card element
   * @private
   */
  _createThemeCard(theme) {
    const card = document.createElement('div');
    card.className = 'theme-card';
    card.dataset.themeId = theme.id;
    
    // Create price badge
    let priceBadge = '';
    if (theme.category === 'premium') {
      priceBadge = `<div class="theme-price-badge">$${theme.pricing.price}</div>`;
    } else if (theme.category === 'free') {
      priceBadge = '<div class="theme-price-badge free">Free</div>';
    } else {
      priceBadge = '<div class="theme-price-badge community">Community</div>';
    }
    
    // Create install/activate button
    let actionButton = '';
    if (theme.installed) {
      actionButton = `
        <button class="theme-activate-btn" data-theme-id="${theme.id}">
          Activate
        </button>
      `;
    } else {
      actionButton = `
        <button class="theme-install-btn" data-theme-id="${theme.id}">
          ${theme.category === 'premium' ? 'Purchase & Install' : 'Install'}
        </button>
      `;
    }
    
    // Set card content
    card.innerHTML = `
      <div class="theme-preview">
        <img src="${theme.previewImage}" alt="${theme.name} Preview">
        ${priceBadge}
      </div>
      <div class="theme-info">
        <h3 class="theme-name">${theme.name}</h3>
        <p class="theme-description">${theme.description}</p>
        <div class="theme-meta">
          <span class="theme-version">v${theme.version}</span>
          <span class="theme-author">by ${theme.author.name}</span>
        </div>
        <div class="theme-tags">
          ${theme.tags.map(tag => `<span class="theme-tag">${tag}</span>`).join('')}
        </div>
      </div>
      <div class="theme-actions">
        ${actionButton}
        <button class="theme-preview-btn" data-theme-id="${theme.id}">
          Preview
        </button>
      </div>
    `;
    
    return card;
  }

  /**
   * Set up event listeners for marketplace interactions
   * @private
   */
  _setupEventListeners() {
    // Filter by category
    const categoryFilter = document.getElementById('filter-category');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this._applyFilters());
    }
    
    // Sort by
    const sortFilter = document.getElementById('filter-sort');
    if (sortFilter) {
      sortFilter.addEventListener('change', () => this._applyFilters());
    }
    
    // Search
    const searchFilter = document.getElementById('filter-search');
    if (searchFilter) {
      searchFilter.addEventListener('input', () => this._applyFilters());
    }
    
    // Install buttons
    document.querySelectorAll('.theme-install-btn').forEach(button => {
      button.addEventListener('click', event => {
        const themeId = event.target.dataset.themeId;
        this.installTheme(themeId);
      });
    });
    
    // Activate buttons
    document.querySelectorAll('.theme-activate-btn').forEach(button => {
      button.addEventListener('click', event => {
        const themeId = event.target.dataset.themeId;
        this.activateTheme(themeId);
      });
    });
    
    // Preview buttons
    document.querySelectorAll('.theme-preview-btn').forEach(button => {
      button.addEventListener('click', event => {
        const themeId = event.target.dataset.themeId;
        this.previewTheme(themeId);
      });
    });
  }

  /**
   * Apply filters to the marketplace themes
   * @private
   */
  _applyFilters() {
    const categoryFilter = document.getElementById('filter-category');
    const sortFilter = document.getElementById('filter-sort');
    const searchFilter = document.getElementById('filter-search');
    
    const category = categoryFilter ? categoryFilter.value : 'all';
    const sortBy = sortFilter ? sortFilter.value : 'name';
    const searchTerm = searchFilter ? searchFilter.value.toLowerCase() : '';
    
    const themesGrid = document.querySelector('.marketplace-themes-grid');
    if (!themesGrid) return;
    
    // Clear existing themes
    themesGrid.innerHTML = '';
    
    // Filter and sort themes
    let filteredThemes = Array.from(this.marketplaceThemes.values());
    
    // Apply category filter
    if (category !== 'all') {
      filteredThemes = filteredThemes.filter(theme => theme.category === category);
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredThemes = filteredThemes.filter(theme => {
        return (
          theme.name.toLowerCase().includes(searchTerm) ||
          theme.description.toLowerCase().includes(searchTerm) ||
          theme.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      });
    }
    
    // Apply sorting
    filteredThemes.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'newest') {
        // In a real implementation, this would compare dates
        return 0;
      } else if (sortBy === 'popular') {
        // In a real implementation, this would compare download counts
        return 0;
      }
      return 0;
    });
    
    // Render filtered themes
    filteredThemes.forEach(theme => {
      const themeCard = this._createThemeCard(theme);
      themesGrid.appendChild(themeCard);
    });
    
    // Re-attach event listeners
    this._setupEventListeners();
  }

  /**
   * Install a theme from the marketplace
   * @param {string} themeId - The ID of the theme to install
   */
  async installTheme(themeId) {
    try {
      // Get theme metadata from marketplace
      const themeMetadata = this.marketplaceThemes.get(themeId);
      if (!themeMetadata) {
        throw new Error(`Theme ${themeId} not found in marketplace`);
      }
      
      // Check if theme is premium and requires purchase
      if (themeMetadata.category === 'premium') {
        const confirmed = await this._handlePremiumPurchase(themeMetadata);
        if (!confirmed) return;
      }
      
      // Show installation progress
      this._showInstallProgress(themeId, 'Downloading theme files...');
      
      // In a real implementation, this would download the theme files
      // For demo purposes, we'll simulate a download delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update progress
      this._showInstallProgress(themeId, 'Validating theme files...');
      
      // Simulate theme validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create theme configuration for installation
      const themeConfig = {
        id: themeMetadata.id,
        name: themeMetadata.name,
        description: themeMetadata.description,
        version: themeMetadata.version,
        author: themeMetadata.author,
        cssFiles: [
          `themes/${themeId}/base.css`,
          `themes/${themeId}/layout.css`,
          `themes/${themeId}/colors.css`,
          `themes/${themeId}/main.css`
        ]
      };
      
      // Validate theme configuration
      const validationResult = this.validator.validateTheme(themeConfig);
      if (!validationResult.valid) {
        throw new Error(`Theme validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // Update progress
      this._showInstallProgress(themeId, 'Installing theme...');
      
      // Add theme to installed themes
      this.installedThemes.set(themeId, themeConfig);
      
      // Save to local storage
      this._saveInstalledThemes();
      
      // Register theme with ThemeRegistry or ScalableThemeSystem
      if (this.themeRegistry) {
        if (typeof this.themeRegistry.registerTheme === 'function') {
          // For both ThemeRegistry and ScalableThemeSystem
          console.log(`Registering theme ${themeConfig.id} with theme system`);
          this.themeRegistry.registerTheme(themeConfig.id, themeConfig);
        } else if (typeof this.themeRegistry.themes !== 'undefined' && typeof this.themeRegistry.themes.set === 'function') {
          // Fallback for mock registry
          console.log(`Adding theme ${themeConfig.id} to mock registry`);
          this.themeRegistry.themes.set(themeConfig.id, themeConfig);
        }
      }
      
      // Update UI to show theme as installed
      this._updateThemeCardStatus(themeId, true);
      
      // Show success message
      this._showInstallProgress(themeId, 'Theme installed successfully!', 'success');
      
      // Hide progress after a delay
      setTimeout(() => {
        this._hideInstallProgress(themeId);
      }, 2000);
      
      // Refresh marketplace UI
      this.marketplaceThemes.get(themeId).installed = true;
      this._applyFilters();
      
      return true;
    } catch (error) {
      console.error(`Failed to install theme ${themeId}:`, error);
      
      // Show error message
      this._showInstallProgress(themeId, `Installation failed: ${error.message}`, 'error');
      
      // Hide progress after a delay
      setTimeout(() => {
        this._hideInstallProgress(themeId);
      }, 3000);
      
      return false;
    }
  }

  /**
   * Activate an installed theme
   * @param {string} themeId - The ID of the theme to activate
   */
  async activateTheme(themeId) {
    try {
      // Check if theme is installed
      if (!this.isThemeInstalled(themeId)) {
        throw new Error(`Theme ${themeId} is not installed`);
      }
      
      // Get theme configuration
      const themeConfig = this.installedThemes.get(themeId);
      
      // Show activation progress
      this._showInstallProgress(themeId, 'Activating theme...');
      
      // Load theme CSS files
      await this.themeLoader.loadTheme(themeConfig.id, themeConfig.cssFiles);
      
      // Activate theme in ThemeRegistry
      // Check if we have a ScalableThemeSystem instance or the old ThemeRegistry
      if (this.themeRegistry.switchTheme && typeof this.themeRegistry.switchTheme === 'function') {
        // Use switchTheme for ScalableThemeSystem
        await this.themeRegistry.switchTheme(themeId);
      } else if (this.themeRegistry.activateTheme && typeof this.themeRegistry.activateTheme === 'function') {
        // Use activateTheme for old ThemeRegistry
        this.themeRegistry.activateTheme(themeId);
      } else {
        // Fallback to direct event dispatch if no activation method is available
        console.warn(`No theme activation method found for ${themeId}, dispatching event only`);
      }
      
      // Dispatch theme changed event
      const event = new CustomEvent('themeChanged', {
        detail: { themeName: themeId, themeId: themeId }
      });
      document.dispatchEvent(event);
      window.dispatchEvent(event); // Dispatch to window as well for broader compatibility
      
      // Show success message
      this._showInstallProgress(themeId, 'Theme activated successfully!', 'success');
      
      // Hide progress after a delay
      setTimeout(() => {
        this._hideInstallProgress(themeId);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error(`Failed to activate theme ${themeId}:`, error);
      
      // Show error message
      this._showInstallProgress(themeId, `Activation failed: ${error.message}`, 'error');
      
      // Hide progress after a delay
      setTimeout(() => {
        this._hideInstallProgress(themeId);
      }, 3000);
      
      return false;
    }
  }

  /**
   * Preview a theme without installing it
   * @param {string} themeId - The ID of the theme to preview
   */
  previewTheme(themeId) {
    // Get theme metadata
    const themeMetadata = this.marketplaceThemes.get(themeId);
    if (!themeMetadata) {
      console.error(`Theme ${themeId} not found in marketplace`);
      return;
    }
    
    // Create modal for theme preview
    const modal = document.createElement('div');
    modal.className = 'theme-preview-modal';
    modal.innerHTML = `
      <div class="theme-preview-modal-content">
        <span class="theme-preview-modal-close">&times;</span>
        <h2>Preview: ${themeMetadata.name}</h2>
        <div class="theme-preview-iframe-container">
          <iframe src="dist/report-preview.html?theme=${themeId}&preview=true" title="Theme Preview"></iframe>
        </div>
        <div class="theme-preview-modal-actions">
          ${!themeMetadata.installed ? `
            <button class="theme-install-btn" data-theme-id="${themeId}">
              ${themeMetadata.category === 'premium' ? 'Purchase & Install' : 'Install'}
            </button>
          ` : `
            <button class="theme-activate-btn" data-theme-id="${themeId}">
              Activate
            </button>
          `}
        </div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeButton = modal.querySelector('.theme-preview-modal-close');
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside content
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Add event listeners for install/activate buttons
    const installButton = modal.querySelector('.theme-install-btn');
    if (installButton) {
      installButton.addEventListener('click', () => {
        document.body.removeChild(modal);
        this.installTheme(themeId);
      });
    }
    
    const activateButton = modal.querySelector('.theme-activate-btn');
    if (activateButton) {
      activateButton.addEventListener('click', () => {
        document.body.removeChild(modal);
        this.activateTheme(themeId);
      });
    }
  }

  /**
   * Uninstall a theme
   * @param {string} themeId - The ID of the theme to uninstall
   */
  uninstallTheme(themeId) {
    try {
      // Check if theme is installed
      if (!this.isThemeInstalled(themeId)) {
        throw new Error(`Theme ${themeId} is not installed`);
      }
      
      // Check if theme is currently active
      const activeTheme = this.themeRegistry.getActiveTheme();
      if (activeTheme && activeTheme.id === themeId) {
        throw new Error(`Cannot uninstall the currently active theme`);
      }
      
      // Remove theme from installed themes
      this.installedThemes.delete(themeId);
      
      // Save to local storage
      this._saveInstalledThemes();
      
      // Unload theme CSS files
      this.themeLoader.unloadTheme(themeId);
      
      // Update marketplace UI
      if (this.marketplaceThemes.has(themeId)) {
        this.marketplaceThemes.get(themeId).installed = false;
        this._updateThemeCardStatus(themeId, false);
      }
      
      // Show success message
      alert(`Theme ${themeId} has been uninstalled`);
      
      return true;
    } catch (error) {
      console.error(`Failed to uninstall theme ${themeId}:`, error);
      alert(`Failed to uninstall theme: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a theme is installed
   * @param {string} themeId - The ID of the theme to check
   * @returns {boolean} Whether the theme is installed
   */
  isThemeInstalled(themeId) {
    return this.installedThemes.has(themeId);
  }

  /**
   * Get a list of all installed themes
   * @returns {Array} Array of installed theme configurations
   */
  getInstalledThemes() {
    return Array.from(this.installedThemes.values());
  }

  /**
   * Handle premium theme purchase flow
   * @param {Object} themeMetadata - The theme metadata
   * @returns {Promise<boolean>} Whether the purchase was confirmed
   * @private
   */
  async _handlePremiumPurchase(themeMetadata) {
    // Create purchase confirmation modal
    const modal = document.createElement('div');
    modal.className = 'theme-purchase-modal';
    modal.innerHTML = `
      <div class="theme-purchase-modal-content">
        <span class="theme-purchase-modal-close">&times;</span>
        <h2>Purchase Theme</h2>
        <div class="theme-purchase-details">
          <img src="${themeMetadata.previewImage}" alt="${themeMetadata.name} Preview">
          <div class="theme-purchase-info">
            <h3>${themeMetadata.name}</h3>
            <p>${themeMetadata.description}</p>
            <div class="theme-purchase-price">
              <span class="price-amount">$${themeMetadata.pricing.price}</span>
              <span class="price-type">${themeMetadata.pricing.type === 'one-time' ? 'One-time purchase' : 'Subscription'}</span>
            </div>
          </div>
        </div>
        <div class="theme-purchase-payment">
          <h3>Payment Details</h3>
          <div class="payment-form">
            <div class="form-group">
              <label for="card-number">Card Number</label>
              <input type="text" id="card-number" placeholder="1234 5678 9012 3456">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="card-expiry">Expiry Date</label>
                <input type="text" id="card-expiry" placeholder="MM/YY">
              </div>
              <div class="form-group">
                <label for="card-cvc">CVC</label>
                <input type="text" id="card-cvc" placeholder="123">
              </div>
            </div>
            <div class="form-group">
              <label for="card-name">Cardholder Name</label>
              <input type="text" id="card-name" placeholder="John Doe">
            </div>
          </div>
        </div>
        <div class="theme-purchase-modal-actions">
          <button class="theme-purchase-cancel-btn">Cancel</button>
          <button class="theme-purchase-confirm-btn">Complete Purchase</button>
        </div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Return a promise that resolves when the purchase is confirmed or rejected
    return new Promise(resolve => {
      // Add event listeners
      const closeButton = modal.querySelector('.theme-purchase-modal-close');
      closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(false);
      });
      
      const cancelButton = modal.querySelector('.theme-purchase-cancel-btn');
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(false);
      });
      
      const confirmButton = modal.querySelector('.theme-purchase-confirm-btn');
      confirmButton.addEventListener('click', () => {
        // In a real implementation, this would process the payment
        document.body.removeChild(modal);
        resolve(true);
      });
      
      // Close modal when clicking outside content
      modal.addEventListener('click', event => {
        if (event.target === modal) {
          document.body.removeChild(modal);
          resolve(false);
        }
      });
    });
  }

  /**
   * Show installation progress for a theme
   * @param {string} themeId - The ID of the theme
   * @param {string} message - The progress message
   * @param {string} type - The message type (info, success, error)
   * @private
   */
  _showInstallProgress(themeId, message, type = 'info') {
    const themeCard = document.querySelector(`.theme-card[data-theme-id="${themeId}"]`);
    if (!themeCard) return;
    
    // Remove existing progress element
    const existingProgress = themeCard.querySelector('.theme-install-progress');
    if (existingProgress) {
      existingProgress.remove();
    }
    
    // Create progress element
    const progressElement = document.createElement('div');
    progressElement.className = `theme-install-progress ${type}`;
    progressElement.innerHTML = `
      <div class="progress-message">${message}</div>
      ${type === 'info' ? '<div class="progress-spinner"></div>' : ''}
    `;
    
    // Add to theme card
    themeCard.appendChild(progressElement);
  }

  /**
   * Hide installation progress for a theme
   * @param {string} themeId - The ID of the theme
   * @private
   */
  _hideInstallProgress(themeId) {
    const themeCard = document.querySelector(`.theme-card[data-theme-id="${themeId}"]`);
    if (!themeCard) return;
    
    const progressElement = themeCard.querySelector('.theme-install-progress');
    if (progressElement) {
      progressElement.remove();
    }
  }

  /**
   * Update theme card to reflect installed status
   * @param {string} themeId - The ID of the theme
   * @param {boolean} installed - Whether the theme is installed
   * @private
   */
  _updateThemeCardStatus(themeId, installed) {
    const themeCard = document.querySelector(`.theme-card[data-theme-id="${themeId}"]`);
    if (!themeCard) return;
    
    const actionsContainer = themeCard.querySelector('.theme-actions');
    if (!actionsContainer) return;
    
    const themeMetadata = this.marketplaceThemes.get(themeId);
    if (!themeMetadata) return;
    
    // Update button
    if (installed) {
      // Replace install button with activate button
      const installButton = actionsContainer.querySelector('.theme-install-btn');
      if (installButton) {
        const activateButton = document.createElement('button');
        activateButton.className = 'theme-activate-btn';
        activateButton.dataset.themeId = themeId;
        activateButton.textContent = 'Activate';
        activateButton.addEventListener('click', () => this.activateTheme(themeId));
        actionsContainer.replaceChild(activateButton, installButton);
      }
    } else {
      // Replace activate button with install button
      const activateButton = actionsContainer.querySelector('.theme-activate-btn');
      if (activateButton) {
        const installButton = document.createElement('button');
        installButton.className = 'theme-install-btn';
        installButton.dataset.themeId = themeId;
        installButton.textContent = themeMetadata.category === 'premium' ? 'Purchase & Install' : 'Install';
        installButton.addEventListener('click', () => this.installTheme(themeId));
        actionsContainer.replaceChild(installButton, activateButton);
      }
    }
  }

  /**
   * Load installed themes from local storage
   * @private
   */
  _loadInstalledThemes() {
    try {
      const storedThemes = localStorage.getItem(this.localStorageKey);
      if (storedThemes) {
        const themes = JSON.parse(storedThemes);
        themes.forEach(theme => {
          this.installedThemes.set(theme.id, theme);
        });
      }
    } catch (error) {
      console.error('Failed to load installed themes from local storage:', error);
    }
  }

  /**
   * Save installed themes to local storage
   * @private
   */
  _saveInstalledThemes() {
    try {
      const themes = Array.from(this.installedThemes.values());
      localStorage.setItem(this.localStorageKey, JSON.stringify(themes));
    } catch (error) {
      console.error('Failed to save installed themes to local storage:', error);
    }
  }
}

export default ThemeMarketplace;
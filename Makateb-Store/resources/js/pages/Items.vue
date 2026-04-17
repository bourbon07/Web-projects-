<template>
  <AppLayout>
    <div class="min-h-screen py-8" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
      <div class="container mx-auto px-4 max-w-7xl">
        <!-- Header with Title, Search, and Notification -->
        <div class="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">My Products</h1>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Manage your inventory and listings</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('search_products')"
                class="pl-10 pr-4 py-2 rounded-lg border w-64"
                :class="isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'"
                @input="filterProducts"
              />
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <!-- Total Products Card -->
          <div class="rounded-lg p-6 shadow-sm" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100" :class="isDarkMode ? 'bg-blue-900/50' : ''">
                <svg class="w-6 h-6 text-blue-600" :class="isDarkMode ? 'text-blue-300' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wide mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Products</p>
                <p class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ totalProducts }}</p>
              </div>
            </div>
          </div>

          <!-- Active Listings Card -->
          <div class="rounded-lg p-6 shadow-sm" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-[#6D4C41]/20" :class="isDarkMode ? 'bg-green-900/50' : ''">
                <svg class="w-6 h-6 text-[#6D4C41]" :class="isDarkMode ? 'text-[#6D4C41]' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wide mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Active Listings</p>
                <p class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ activeListings }}</p>
              </div>
            </div>
          </div>

          <!-- Low Stock Card -->
          <div class="rounded-lg p-6 shadow-sm" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100" :class="isDarkMode ? 'bg-orange-900/50' : ''">
                <svg class="w-6 h-6 text-orange-600" :class="isDarkMode ? 'text-orange-300' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wide mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Low Stock</p>
                <p class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ lowStockCount }}</p>
              </div>
            </div>
          </div>
      </div>
      
        <!-- Main Content: Table and Sidebar -->
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Product Table (Left - 2/3 width) -->
          <div class="flex-1 lg:w-2/3">
            <div class="rounded-lg shadow-sm overflow-hidden" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
      <div v-if="loading" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
        Loading...
      </div>
              <div v-else-if="filteredProducts.length === 0" class="text-center py-12" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                No products found
              </div>
              <div v-else>
                <table class="w-full">
                  <thead>
                    <tr class="border-b" :class="isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'">
                      <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors" :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600'" @click="sortBy('image')">
                        <div class="flex items-center gap-2">
                          <span>Product</span>
                          <svg v-if="sortField === 'image'" class="w-4 h-4" :class="sortOrder === 'asc' ? '' : 'transform rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </div>
                      </th>
                      <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors" :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600'" @click="sortBy('name')">
                        <div class="flex items-center gap-2">
                          <span>Name</span>
                          <svg v-if="sortField === 'name'" class="w-4 h-4" :class="sortOrder === 'asc' ? '' : 'transform rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </div>
                      </th>
                      <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors" :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600'" @click="sortBy('price')">
                        <div class="flex items-center gap-2">
                          <span>Price</span>
                          <svg v-if="sortField === 'price'" class="w-4 h-4" :class="sortOrder === 'asc' ? '' : 'transform rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </div>
                      </th>
                      <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors" :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600'" @click="sortBy('description')">
                        <div class="flex items-center gap-2">
                          <span>Description</span>
                          <svg v-if="sortField === 'description'" class="w-4 h-4" :class="sortOrder === 'asc' ? '' : 'transform rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                          </svg>
      </div>
                      </th>
                      <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="product in paginatedProducts"
          :key="product.id" 
                      class="border-b hover:bg-gray-50 transition-colors"
                      :class="isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200'"
        >
                      <td class="py-4 px-4">
          <div
            v-if="!product.image_url"
            class="w-16 h-16 rounded flex items-center justify-center"
            :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'"
          >
            <svg class="w-10 h-10" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <img 
            v-else
            :src="product.image_url" 
            :alt="product.name" 
                          class="w-16 h-16 object-cover rounded"
          />
                      </td>
                      <td class="py-4 px-4">
                        <div>
                          <p class="font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ product.name }}</p>
                          <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">ID: #SKU-{{ String(product.id).padStart(4, '0') }}</p>
          </div>
                      </td>
                      <td class="py-4 px-4">
                        <p class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ formatPrice(product.price) }} JD</p>
                      </td>
                      <td class="py-4 px-4">
                        <p class="text-sm line-clamp-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">{{ getLocalizedDescription(product) || t('no_description_available') }}</p>
                      </td>
                      <td class="py-4 px-4">
                        <div class="flex items-center gap-3">
            <button 
              @click="editProduct(product)" 
                            class="p-2 rounded-lg transition-colors"
                            :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
                            title="Edit"
            >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
            </button>
            <button 
              @click="openCategoryModal(product)" 
                            class="p-2 rounded-lg transition-colors"
                            :class="isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'"
                            title="Add to Category"
            >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
            </button>
            <button 
              @click="openPackageModal(product)" 
                            class="p-2 rounded-lg transition-colors"
                            :class="isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-500 hover:bg-gray-100'"
                            title="Add to Package"
            >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
            </button>
            <button 
              @click="deleteProduct(product.id)" 
                            class="p-2 rounded-lg transition-colors"
                            :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
                            title="Delete"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Pagination -->
                <div class="flex items-center justify-between px-4 py-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ sortedProducts.length }} products
                  </p>
                  <div class="flex items-center gap-2">
                    <button
                      @click="currentPage > 1 && currentPage--"
                      :disabled="currentPage === 1"
                      class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700 disabled:hover:bg-transparent' : 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      v-for="page in visiblePages"
                      :key="page"
                      @click="currentPage = page"
                      class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      :class="page === currentPage 
                        ? (isDarkMode ? 'bg-[#6D4C41] text-white' : 'bg-[#6D4C41] text-white')
                        : (isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')"
                    >
                      {{ page }}
                    </button>
                    <button
                      @click="currentPage < totalPages && currentPage++"
                      :disabled="currentPage === totalPages"
                      class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700 disabled:hover:bg-transparent' : 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'"
            >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
            </button>
                  </div>
          </div>
        </div>
      </div>
    </div>

          <!-- Add New Product Sidebar (Right - 1/3 width) -->
          <div class="lg:w-1/3">
            <div class="rounded-lg shadow-sm sticky top-6" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
              <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <div>
                  <h2 class="text-lg font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ editingProductId ? 'Edit Product' : 'Add New Product' }}</h2>
                  <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Basic information for your item</p>
                </div>
                <button
                  v-if="showSidebar"
                  @click="closeSidebar"
                  class="p-1 rounded-lg transition-colors"
                  :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="p-6 space-y-4">
                <!-- Product Name -->
          <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Product Name *</label>
            <input
              v-model="productForm.name"
              type="text"
                    placeholder="e.g. Wireless Headphones"
              required
              class="w-full px-4 py-2 rounded-lg border"
                    :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'"
            />
          </div>

                <!-- Category -->
          <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Category</label>
                  <select
                    v-model="productForm.category_id"
                    class="w-full px-4 py-2 rounded-lg border"
                    :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'"
                    :disabled="loadingCategories"
                  >
                    <option :value="null">{{ loadingCategories ? t('loading_categories') : t('select_category') }}</option>
                    <option
                      v-for="category in validCategories"
                      :key="`category-${category.id}`"
                      :value="category.id"
                    >
                      {{ getLocalizedName(category) }}
                    </option>
                  </select>
                  <p v-if="validCategories.length === 0 && !loadingCategories" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    No categories available. Admin needs to create categories first.
                  </p>
          </div>
          
                <!-- Price -->
          <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Price</label>
                  <div class="flex gap-2">
                    <div class="flex-1 relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">JD</span>
            <input
              v-model="productForm.price"
              type="number"
              step="0.01"
              min="0"
                        placeholder="0.00"
                        class="w-full pl-10 pr-4 py-2 rounded-lg border"
                        :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'"
                      />
                    </div>
                    <select
                      v-model="productForm.currency"
                      class="px-4 py-2 rounded-lg border"
                      :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'"
                    >
                      <option value="JD">JD</option>
                    </select>
                  </div>
                </div>

                <!-- Stock -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Stock</label>
                  <input
                    v-model="productForm.stock"
                    type="number"
                    min="0"
                    placeholder="Enter stock quantity"
              class="w-full px-4 py-2 rounded-lg border"
                    :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'"
            />
          </div>
          
                <!-- Description -->
          <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Description</label>
            <textarea
              v-model="productForm.description"
              rows="4"
                    placeholder="Describe your product..."
              class="w-full px-4 py-2 rounded-lg border"
                    :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'"
            ></textarea>
          </div>
          
                <!-- To Packages -->
          <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">To Packages</label>
                  <div v-if="loadingFormPackages" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ t('loading_packages') }}
                  </div>
                  <div v-else-if="formPackages.length === 0" class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    No packages available
                  </div>
                  <div v-else class="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3" :class="isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'">
                    <label
                      v-for="pkg in formPackages"
                      :key="pkg.id"
                      class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-opacity-50 transition-colors"
                      :class="isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'"
                    >
                      <input
                        type="checkbox"
                        :value="pkg.id"
                        v-model="productForm.package_ids"
                        class="w-4 h-4 rounded border-2 transition-colors accent-[#6D4C41]"
                        :class="isDarkMode 
                          ? 'bg-gray-700 border-gray-600 checked:bg-[#6D4C41] checked:border-[#6D4C41] focus:ring-[#6D4C41]' 
                          : 'bg-white border-gray-300 checked:bg-[#6D4C41] checked:border-[#6D4C41] focus:ring-[#6D4C41]'"
                      />
                      <div class="flex items-center gap-2 flex-1">
                        <img
                          v-if="pkg.image_url"
                          :src="pkg.image_url"
                          :alt="pkg.name"
                          class="w-8 h-8 rounded object-cover"
                          @error="$event.target.src = '/placeholder.png'"
                        />
                        <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ getLocalizedName(pkg) }}
                        </span>
                        <span class="text-xs ml-auto" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          ({{ pkg.products_count || 0 }} items)
                        </span>
                      </div>
                    </label>
                  </div>
          </div>
          
                <!-- Product Images -->
          <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Product Images</label>
                  
                  <!-- URL Input -->
                  <div class="mb-3">
                    <div class="flex gap-2 flex-wrap">
                      <input
                        v-model="newImageUrl"
                        type="url"
                        class="flex-1 min-w-[200px] px-4 py-2 rounded-lg border"
                        :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                        placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                        @keyup.enter="addImageUrl"
                      />
                      <button
                        @click="addImageUrl"
                        type="button"
                        class="px-4 py-2 rounded-lg font-medium transition-colors"
                        :class="isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        Add URL
                      </button>
                      <label
                        class="px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                        :class="isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          @change="handleFileUpload"
                          class="hidden"
                        />
                        Upload Image
                      </label>
                      <button
                        @click="openImageSelector"
                        type="button"
                        class="px-4 py-2 rounded-lg font-medium transition-colors"
                        :class="isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        Select from Cloudinary
                      </button>
                    </div>
                  </div>
                  
                  <div
                    @click="openImageSelector"
                    class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                    :class="isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'"
                  >
                    <svg class="w-12 h-12 mx-auto mb-2" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Click to select from Cloudinary</p>
                    <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Or upload image / enter URL above</p>
                  </div>
                  <div v-if="productForm.image_urls.length > 0" class="mt-3 grid grid-cols-4 gap-2">
                <div
                  v-for="(url, index) in productForm.image_urls"
                  :key="index"
                  class="relative"
                >
                  <img :src="url" class="w-full h-20 object-cover rounded" />
                  <button
                    @click="removeProductImage(index)"
                    class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-2 pt-4">
                  <button
                    @click="editingProductId ? updateProduct() : createProduct()"
                    :disabled="creating"
                    class="w-full px-4 py-2 bg-[#6D4C41] text-white rounded-lg hover:bg-[#5a3f35] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ creating ? (editingProductId ? 'Updating...' : 'Publishing...') : (editingProductId ? 'Update Product' : 'Publish Product') }}
                  </button>
                  <button
                    v-if="!editingProductId"
                    @click="saveAsDraft"
                    :disabled="creating"
                    class="w-full text-sm text-blue-600 hover:underline transition-colors"
                    :class="isDarkMode ? 'text-blue-400' : ''"
                  >
                    Save as Draft
                  </button>
                  <button
                    v-if="editingProductId"
                    @click="cancelEdit"
                    :disabled="creating"
                    class="w-full text-sm text-gray-600 hover:underline transition-colors"
                    :class="isDarkMode ? 'text-gray-400' : ''"
                  >
                    Cancel
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      <!-- Image Selector Modal -->
      <div
        v-if="showImageSelector"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
        @click.self="showImageSelector = false"
      >
        <div class="rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" :class="isDarkMode ? 'bg-gray-800' : 'bg-white'">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Select Images</h3>
          <button
              @click="showImageSelector = false"
              class="p-1 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
          >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
          </div>

          <div v-if="cloudinaryLoading" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            Loading images...
          </div>
          <div v-else-if="cloudinaryError" class="text-center py-4 px-4 rounded-lg" :class="isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'">
            <p class="font-semibold mb-2">{{ cloudinaryError }}</p>
            <p class="text-sm">Please check your Cloudinary configuration in .env file</p>
          </div>
          <div v-else-if="cloudinaryImages.length === 0" class="text-center py-4 px-4 rounded-lg" :class="isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-600'">
            <p class="font-semibold mb-2">No images found in Cloudinary</p>
            <p class="text-sm">Upload images to your Cloudinary account first</p>
          </div>
          <div v-else class="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
            <div
              v-for="img in cloudinaryImages"
              :key="img.public_id || img.url"
              class="relative cursor-pointer"
              @click="toggleProductImage(img.url)"
            >
              <img
                :src="img.url"
                @error="handleProductImageError"
                class="w-full h-24 object-cover rounded border-2 transition-all"
                :class="productForm.image_urls.includes(img.url) ? 'border-[#6D4C41] ring-2 ring-[#6D4C41]' : (isDarkMode ? 'border-gray-600' : 'border-gray-300')"
                alt="Cloudinary image"
              />
              <div v-if="productForm.image_urls.includes(img.url)" class="absolute top-1 right-1 bg-[#6D4C41] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              @click="showImageSelector = false"
              class="px-4 py-2 bg-[#6D4C41] text-white rounded-lg hover:bg-[#5a3f35] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Selection Modal -->
    <div
      v-if="showCategoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeCategoryModal"
    >
      <div
        class="rounded-xl shadow-xl max-w-md w-full"
        :class="isDarkMode ? 'bg-gray-800' : 'bg-white'"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Assign Category
            </h2>
            <button
              @click="closeCategoryModal"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="currentProduct" class="mb-4">
            <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Product:</p>
            <p class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ currentProduct.name }}</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Select Category
            </label>
            <select
              v-model="selectedCategoryId"
              class="w-full px-4 py-2 rounded-lg border"
              :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'"
              :disabled="loadingCategories || updatingCategory"
            >
              <option :value="null">No category</option>
              <option
                v-for="category in validCategories"
                :key="`category-${category.id}`"
                :value="category.id"
              >
                {{ getLocalizedName(category) }}
              </option>
            </select>
            <p v-if="validCategories.length === 0 && !loadingCategories" class="text-xs mt-2" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
              No categories available. Admin needs to create categories first.
            </p>
          </div>

          <div class="flex items-center justify-end gap-3">
            <button
              @click="closeCategoryModal"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              :disabled="updatingCategory"
            >
              Cancel
            </button>
            <button
              @click="updateProductCategory"
              class="px-4 py-2 rounded-lg font-medium text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              :disabled="updatingCategory || loadingCategories"
            >
              {{ updatingCategory ? 'Updating...' : 'Update Category' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Package Selection Modal -->
    <div
      v-if="showPackageModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closePackageModal"
    >
      <div
        class="rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-gray-800' : 'bg-white'"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Add Product to Package
            </h2>
            <button
              @click="closePackageModal"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="loadingPackages" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            {{ t('loading_packages') }}
          </div>
          <div v-else-if="availablePackages.length === 0" class="text-center py-8" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            No packages available
          </div>
          <div v-else>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Select packages to add <strong>{{ currentProduct?.name }}</strong> to:
            </p>
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="pkg in availablePackages"
                :key="pkg.id"
                class="flex items-center justify-between p-4 rounded-lg border"
                :class="isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="pkg.image_url || '/placeholder.png'"
                    :alt="pkg.name"
                    class="w-12 h-12 rounded object-cover"
                    @error="$event.target.src = '/placeholder.png'"
                  />
                  <div>
                    <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ pkg.name }}
                    </div>
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ pkg.products_count || 0 }} products
                    </div>
                  </div>
                </div>
                <button
                  @click="addProductToPackage(pkg.id)"
                  :disabled="addingToPackage"
                  class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors disabled:opacity-50"
                >
                  {{ addingToPackage ? 'Adding...' : 'Add' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Selection Modal -->
    <div
      v-if="showCategoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeCategoryModal"
    >
      <div
        class="rounded-xl shadow-xl max-w-md w-full"
        :class="isDarkMode ? 'bg-gray-800' : 'bg-white'"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Assign Category
            </h2>
            <button
              @click="closeCategoryModal"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="currentProduct" class="mb-4">
            <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Product:</p>
            <p class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ currentProduct.name }}</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Select Category
            </label>
            <select
              v-model="selectedCategoryId"
              class="w-full px-4 py-2 rounded-lg border"
              :class="isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'"
              :disabled="loadingCategories || updatingCategory"
            >
              <option :value="null">No category</option>
              <option
                v-for="category in validCategories"
                :key="`category-${category.id}`"
                :value="category.id"
              >
                {{ getLocalizedName(category) }}
              </option>
            </select>
            <p v-if="validCategories.length === 0 && !loadingCategories" class="text-xs mt-2" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
              No categories available. Admin needs to create categories first.
            </p>
          </div>

          <div class="flex items-center justify-end gap-3">
            <button
              @click="closeCategoryModal"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              :disabled="updatingCategory"
            >
              Cancel
            </button>
            <button
              @click="updateProductCategory"
              class="px-4 py-2 rounded-lg font-medium text-white bg-[#6D4C41] hover:bg-[#5a3f35] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              :disabled="updatingCategory || loadingCategories"
            >
              {{ updatingCategory ? 'Updating...' : 'Update Category' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore } from '../stores/language';
import AppLayout from '../components/AppLayout.vue';
import { ChevronLeft } from 'lucide-vue-next';
import { formatPriceDisplay } from '../utils/currency';
import { confirmAction } from '../utils/confirmation';
import { showNotification } from '../utils/notifications';

const authStore = useAuthStore();
const languageStore = useLanguageStore();
const t = languageStore.t;
const getLocalizedName = languageStore.getLocalizedName;
const getLocalizedDescription = languageStore.getLocalizedDescription;
const products = ref([]);
const filteredProducts = ref([]);
const loading = ref(false);
const showSidebar = ref(true);
const showImageSelector = ref(false);
const creating = ref(false);
const editingProductId = ref(null);
const cloudinaryImages = ref([]);
const cloudinaryLoading = ref(false);
const cloudinaryError = ref('');
const newImageUrl = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 4;
const sortField = ref(null);
const sortOrder = ref('asc');
const showPackageModal = ref(false);
const showCategoryModal = ref(false);
const currentProduct = ref(null);
const availablePackages = ref([]);
const loadingPackages = ref(false);
const addingToPackage = ref(false);
const updatingCategory = ref(false);
const selectedCategoryId = ref(null);
const formPackages = ref([]);
const loadingFormPackages = ref(false);

const categories = ref([]);
const loadingCategories = ref(false);

const fetchCategories = async () => {
  loadingCategories.value = true;
  try {
    const response = await window.axios.get('/categories');
    const data = response.data || [];
    // Filter out any null or invalid categories with strict validation
    if (Array.isArray(data)) {
      categories.value = data
        .filter(c => c !== null && c !== undefined && typeof c === 'object')
        .filter(c => c.id !== null && c.id !== undefined && c.name !== null && c.name !== undefined && c.name !== '')
        .map(c => ({ id: c.id, name: c.name, description: c.description || '', image_url: c.image_url || null }));
    } else {
      categories.value = [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = [];
  } finally {
    loadingCategories.value = false;
  }
};

const productForm = ref({
  name: '',
  category_id: null,
  price: '',
  stock: '',
  description: '',
  image_urls: [],
  is_active: true,
  currency: 'JD',
  package_ids: [],
});

const isDarkMode = computed(() => authStore.isDarkMode);

const validCategories = computed(() => {
  if (!Array.isArray(categories.value)) {
    return [];
  }
  return categories.value
    .filter(c => c !== null && c !== undefined && typeof c === 'object')
    .filter(c => c.id !== null && c.id !== undefined && c.name !== null && c.name !== undefined);
});

const totalProducts = computed(() => products.value.length);
const activeListings = computed(() => products.value.filter(p => p.is_active).length);
const lowStockCount = computed(() => products.value.filter(p => p.stock < 10).length);

const sortedProducts = computed(() => {
  if (!sortField.value) {
    return filteredProducts.value;
  }
  
  const sorted = [...filteredProducts.value];
  sorted.sort((a, b) => {
    let aVal, bVal;
    
    switch (sortField.value) {
      case 'name':
        aVal = (a.name || '').toLowerCase();
        bVal = (b.name || '').toLowerCase();
        break;
      case 'price':
        aVal = parseFloat(a.price) || 0;
        bVal = parseFloat(b.price) || 0;
        break;
      case 'description':
        aVal = (a.description || '').toLowerCase();
        bVal = (b.description || '').toLowerCase();
        break;
      case 'image':
        // Sort by whether image exists
        aVal = a.image_url ? 1 : 0;
        bVal = b.image_url ? 1 : 0;
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
});

const totalPages = computed(() => Math.ceil(sortedProducts.value.length / itemsPerPage));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, sortedProducts.value.length));
const paginatedProducts = computed(() => {
  return sortedProducts.value.slice(startIndex.value, endIndex.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 3; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 2; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push('...');
      pages.push(total);
    }
  }
  
  return pages.filter(p => p !== '...' || pages.indexOf(p) === 0 || pages.indexOf(p) === pages.length - 1);
});

const formatPrice = (price) => {
  return formatPriceDisplay(price);
};

const sortBy = (field) => {
  if (sortField.value === field) {
    // Toggle sort order if clicking the same field
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new sort field and default to ascending
    sortField.value = field;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1; // Reset to first page when sorting
};

const filterProducts = () => {
  if (!searchQuery.value.trim()) {
    filteredProducts.value = products.value;
  } else {
    const query = searchQuery.value.toLowerCase();
    filteredProducts.value = products.value.filter(product =>
      product.name.toLowerCase().includes(query) ||
      String(product.id).includes(query)
    );
  }
  currentPage.value = 1; // Reset to first page when filtering
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await window.axios.get('/admin/products');
    products.value = Array.isArray(response.data) ? response.data : [];
    filteredProducts.value = products.value;
  } catch (error) {
    console.error('Error fetching products:', error);
    products.value = [];
    filteredProducts.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchCloudinaryImages = async () => {
  cloudinaryLoading.value = true;
  cloudinaryError.value = '';
  cloudinaryImages.value = [];
  
  try {
    const response = await window.axios.get('/list-images');
    
    // Handle different response formats
    if (response.data.images && Array.isArray(response.data.images)) {
      // Format: { images: [{ url, public_id, ... }] }
      cloudinaryImages.value = response.data.images.map(img => ({
        url: img.url || img.secure_url || '',
        public_id: img.public_id || '',
        width: img.width || 0,
        height: img.height || 0,
        format: img.format || ''
      }));
    } else if (Array.isArray(response.data)) {
      // Format: [{ url, public_id, ... }]
      cloudinaryImages.value = response.data.map(img => ({
        url: img.url || img.secure_url || '',
        public_id: img.public_id || '',
        width: img.width || 0,
        height: img.height || 0,
        format: img.format || ''
      }));
    } else if (response.data.resources && Array.isArray(response.data.resources)) {
      // Format: { resources: [{ secure_url, public_id, ... }] }
      cloudinaryImages.value = response.data.resources.map(img => ({
        url: img.secure_url || img.url || '',
        public_id: img.public_id || '',
        width: img.width || 0,
        height: img.height || 0,
        format: img.format || ''
      }));
    } else {
      cloudinaryImages.value = [];
    }
    
    if (response.data.error) {
      const errorMsg = response.data.error;
      cloudinaryError.value = errorMsg;
      
      if (errorMsg.includes('not installed')) {
        cloudinaryError.value = 'Cloudinary package not installed. Run: composer require cloudinary/cloudinary_php';
      } else if (errorMsg.includes('not configured')) {
        cloudinaryError.value = 'Cloudinary credentials not configured. Add CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env file.';
      }
    }
  } catch (error) {
    console.error('Error fetching Cloudinary images:', error);
    cloudinaryImages.value = [];
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch Cloudinary images';
    cloudinaryError.value = errorMsg;
  } finally {
    cloudinaryLoading.value = false;
  }
};

const openImageSelector = () => {
  showImageSelector.value = true;
  if (cloudinaryImages.value.length === 0) {
    fetchCloudinaryImages();
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showNotification(t('please_select_image_file'), 'warning');
    return;
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showNotification(t('file_size_too_large'), 'warning');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await window.axios.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data.url) {
      if (productForm.value.image_urls.length < 10) {
        if (!productForm.value.image_urls.includes(response.data.url)) {
          productForm.value.image_urls.push(response.data.url);
          showNotification(t('image_uploaded_successfully'), 'success');
        } else {
          showNotification(t('image_already_added'), 'warning');
        }
      } else {
        showNotification(t('maximum_images_allowed'), 'warning');
      }
    } else {
      showNotification(t('failed_to_upload_image'), 'error');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    showNotification(error.response?.data?.message || t('failed_to_upload_image'), 'error');
  } finally {
    // Reset file input
    event.target.value = '';
  }
};

const toggleProductImage = (url) => {
  const index = productForm.value.image_urls.indexOf(url);
  if (index > -1) {
    productForm.value.image_urls.splice(index, 1);
  } else {
    if (productForm.value.image_urls.length < 10) {
      productForm.value.image_urls.push(url);
    } else {
      showNotification(t('maximum_images_allowed'), 'warning');
    }
  }
};

const removeProductImage = (index) => {
  productForm.value.image_urls.splice(index, 1);
};

const addImageUrl = () => {
  if (!newImageUrl.value.trim()) {
    return;
  }
  
  // Normalize and validate URL
  let url = newImageUrl.value.trim();
  
  // Add protocol if missing
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }
  
  // Validate URL
  try {
    const urlObj = new URL(url);
    // Ensure it's http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      showNotification(t('please_enter_valid_http_url'), 'warning');
      return;
    }
    
    if (productForm.value.image_urls.length < 10) {
      if (!productForm.value.image_urls.includes(url)) {
        productForm.value.image_urls.push(url);
        newImageUrl.value = '';
      } else {
        showNotification(t('image_url_already_added'), 'warning');
      }
    } else {
      showNotification(t('maximum_images_allowed'), 'warning');
    }
  } catch (e) {
    showNotification(t('please_enter_valid_url'), 'warning');
  }
};

const handleProductImageError = (event) => {
  console.error('Product image failed to load:', event.target.src);
  event.target.src = '/placeholder.png';
};

const closeSidebar = () => {
  showSidebar.value = false;
  resetForm();
  editingProductId.value = null;
};

const resetForm = () => {
  productForm.value = {
    name: '',
    category_id: null,
    price: '',
    stock: '',
    description: '',
    image_urls: [],
    is_active: true,
    currency: 'JD',
    package_ids: [],
  };
  editingProductId.value = null;
  formPackages.value = [];
};

const fetchFormPackages = async () => {
  loadingFormPackages.value = true;
  try {
    const response = await window.axios.get('/packages');
    formPackages.value = response.data || [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    formPackages.value = [];
  } finally {
    loadingFormPackages.value = false;
  }
};

const fetchProductPackages = async (productId) => {
  try {
    // Fetch all packages and check which ones contain this product
    const packagesResponse = await window.axios.get('/packages');
    const allPackages = packagesResponse.data || [];
    
    // For each package, check if product is in it
    const productPackages = [];
    for (const pkg of allPackages) {
      try {
        const productsResponse = await window.axios.get(`/packages/${pkg.id}/products`);
        const products = productsResponse.data || [];
        if (products.some(p => p.id === productId)) {
          productPackages.push(pkg.id);
        }
      } catch (error) {
        console.error(`Error checking package ${pkg.id}:`, error);
      }
    }
    
    productForm.value.package_ids = productPackages;
  } catch (error) {
    console.error('Error fetching product packages:', error);
    productForm.value.package_ids = [];
  }
};

const createProduct = async () => {
  if (!productForm.value.name || !productForm.value.price || !productForm.value.description) {
    showNotification(t('please_fill_all_required_fields'), 'warning');
    return;
  }
  
  creating.value = true;
  try {
    const productData = {
      name: productForm.value.name,
      category_id: productForm.value.category_id,
      price: parseFloat(productForm.value.price),
      description: productForm.value.description,
      stock: productForm.value.stock ? parseInt(productForm.value.stock) : 100,
      is_active: true, // Always active since status option removed
    };
    
    if (productForm.value.image_urls.length > 0) {
      productData.image_url = productForm.value.image_urls[0];
      productData.image_urls = productForm.value.image_urls;
    }
    
    const response = await window.axios.post('/products', productData);
    const newProductId = response.data.id || response.data.data?.id;
    
    // Add product to selected packages
    if (productForm.value.package_ids && productForm.value.package_ids.length > 0 && newProductId) {
      for (const packageId of productForm.value.package_ids) {
        try {
          await window.axios.post('/packages/add-product', {
            package_id: packageId,
            product_id: newProductId,
          });
        } catch (error) {
          console.error(`Error adding product to package ${packageId}:`, error);
        }
      }
    }
    
    resetForm();
    await fetchProducts();
    showNotification(t('product_created_successfully'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_create_product'), 'error');
  } finally {
    creating.value = false;
  }
};

const saveAsDraft = async () => {
  if (!productForm.value.name || !productForm.value.price || !productForm.value.description) {
    showNotification(t('please_fill_all_required_fields'), 'warning');
    return;
  }
  
  creating.value = true;
  try {
    const productData = {
      name: productForm.value.name,
      price: parseFloat(productForm.value.price),
      description: productForm.value.description,
      stock: productForm.value.stock ? parseInt(productForm.value.stock) : 100,
      is_active: false, // Save as draft
    };
    
    // Only include category_id if it's selected
    if (productForm.value.category_id) {
      productData.category_id = productForm.value.category_id;
    }
    
    if (productForm.value.image_urls.length > 0) {
      productData.image_url = productForm.value.image_urls[0];
      productData.image_urls = productForm.value.image_urls;
    }
    
    const response = await window.axios.post('/products', productData);
    const newProductId = response.data.id || response.data.data?.id;
    
    // Add product to selected packages
    if (productForm.value.package_ids && productForm.value.package_ids.length > 0 && newProductId) {
      for (const packageId of productForm.value.package_ids) {
        try {
          await window.axios.post('/packages/add-product', {
            package_id: packageId,
            product_id: newProductId,
          });
        } catch (error) {
          console.error(`Error adding product to package ${packageId}:`, error);
        }
      }
    }
    
    resetForm();
    await fetchProducts();
    showNotification(t('product_saved_as_draft'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_save_product'), 'error');
  } finally {
    creating.value = false;
  }
};

const editProduct = async (product) => {
  editingProductId.value = product.id;
  productForm.value = {
    name: product.name || '',
    category_id: product.category_id || null,
    price: product.price || '',
    stock: product.stock || '',
    description: product.description || '',
    image_urls: Array.isArray(product.image_urls) ? product.image_urls : (product.image_urls ? JSON.parse(product.image_urls) : []),
    is_active: product.is_active !== undefined ? product.is_active : true,
    currency: 'JD',
    package_ids: [],
  };
  
  // Fetch packages for the form
  await fetchFormPackages();
  
  // Fetch which packages this product is in
  await fetchProductPackages(product.id);
  
  showSidebar.value = true;
  // Scroll to sidebar
  setTimeout(() => {
    document.querySelector('.lg\\:w-1\\/3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};

const updateProduct = async () => {
  if (!productForm.value.name || !productForm.value.price || !productForm.value.description) {
    showNotification(t('please_fill_all_required_fields'), 'warning');
    return;
  }
  
  if (!editingProductId.value) return;
  
  creating.value = true;
  try {
    const productData = {
      name: productForm.value.name,
      price: parseFloat(productForm.value.price),
      description: productForm.value.description,
      stock: productForm.value.stock ? parseInt(productForm.value.stock) : 100,
      is_active: true, // Always active since status option removed
    };
    
    // Only include category_id if it's selected, otherwise set to null
    productData.category_id = productForm.value.category_id || null;
    
    if (productForm.value.image_urls.length > 0) {
      productData.image_url = productForm.value.image_urls[0];
      productData.image_urls = productForm.value.image_urls;
    }
    
    await window.axios.put(`/admin/products/${editingProductId.value}`, productData);
    
    // Update package associations
    // First, get all packages and find which ones contain this product
    const packagesResponse = await window.axios.get('/packages');
    const allPackages = packagesResponse.data || [];
    
    const currentPackageIds = [];
    for (const pkg of allPackages) {
      try {
        const productsResponse = await window.axios.get(`/packages/${pkg.id}/products`);
        const products = productsResponse.data || [];
        if (products.some(p => p.id === editingProductId.value)) {
          currentPackageIds.push(pkg.id);
        }
      } catch (error) {
        console.error(`Error checking package ${pkg.id}:`, error);
      }
    }
    
    // Remove from packages that are not selected
    const packagesToRemove = currentPackageIds.filter(id => !productForm.value.package_ids.includes(id));
    for (const packageId of packagesToRemove) {
      try {
        await window.axios.post('/packages/remove-product', {
          package_id: packageId,
          product_id: editingProductId.value,
        });
      } catch (error) {
        console.error(`Error removing product from package ${packageId}:`, error);
      }
    }
    
    // Add to newly selected packages
    const packagesToAdd = productForm.value.package_ids.filter(id => !currentPackageIds.includes(id));
    for (const packageId of packagesToAdd) {
      try {
        await window.axios.post('/packages/add-product', {
          package_id: packageId,
          product_id: editingProductId.value,
        });
      } catch (error) {
        console.error(`Error adding product to package ${packageId}:`, error);
      }
    }
    
    resetForm();
    await fetchProducts();
    showNotification(t('product_updated_successfully'), 'success');
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_update_product'), 'error');
  } finally {
    creating.value = false;
  }
};

const cancelEdit = () => {
  resetForm();
};

const deleteProduct = async (productId) => {
  const confirmed = await confirmAction({
    action: t('delete_this_product') || 'delete this product',
    message: t('are_you_sure_delete_product_permanent') || 'Are you sure you want to delete this product? This action cannot be undone.',
    destructive: true
  });
  if (!confirmed) return;
  
  try {
    await window.axios.delete(`/admin/products/${productId}`);
    await fetchProducts();
    showNotification(t('product_deleted_successfully'), 'success');
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification(error.response?.data?.message || t('failed_to_delete_product'), 'error');
  }
};

const openPackageModal = async (product) => {
  currentProduct.value = product;
  loadingPackages.value = true;
  showPackageModal.value = true;
  try {
    const response = await window.axios.get('/packages');
    availablePackages.value = response.data || [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    showNotification(t('failed_to_load_packages'), 'error');
    availablePackages.value = [];
  } finally {
    loadingPackages.value = false;
  }
};

const closePackageModal = () => {
  showPackageModal.value = false;
  currentProduct.value = null;
  availablePackages.value = [];
};

const addProductToPackage = async (packageId) => {
  if (!currentProduct.value) return;
  
  addingToPackage.value = true;
  try {
    await window.axios.post('/packages/add-product', {
      package_id: packageId,
      product_id: currentProduct.value.id,
    });
    showNotification(t('product_added_to_package_successfully'), 'success');
    closePackageModal();
  } catch (error) {
    showNotification(error.response?.data?.message || t('failed_to_add_product_to_package'), 'error');
  } finally {
    addingToPackage.value = false;
  }
};

const openCategoryModal = (product) => {
  currentProduct.value = product;
  selectedCategoryId.value = product.category_id || null;
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  currentProduct.value = null;
  selectedCategoryId.value = null;
};

const updateProductCategory = async () => {
  if (!currentProduct.value) return;
  
  updatingCategory.value = true;
  try {
    const productData = {
      category_id: selectedCategoryId.value || null,
    };
    
    await window.axios.put(`/admin/products/${currentProduct.value.id}`, productData);
    
    // Update local product data
    const productIndex = products.value.findIndex(p => p.id === currentProduct.value.id);
    if (productIndex !== -1) {
      products.value[productIndex].category_id = selectedCategoryId.value;
    }
    
    showNotification(t('category_updated_successfully'), 'success');
    closeCategoryModal();
    await fetchProducts(); // Refresh products list
  } catch (error) {
    console.error('Error updating product category:', error);
    showNotification(error.response?.data?.message || t('failed_to_update_product_category'), 'error');
  } finally {
    updatingCategory.value = false;
  }
};


onMounted(() => {
  fetchProducts();
  fetchCategories(); // Load categories when component mounts
  fetchFormPackages(); // Load packages when component mounts
});
</script>

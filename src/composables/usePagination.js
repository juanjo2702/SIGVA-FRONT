import { ref, computed } from 'vue'

/**
 * Composable para manejar paginación con loading y fetch
 * @param {Function} fetchFn - Función que recibe params de paginación y retorna data
 * @param {number} initialPerPage - Filas por página inicial
 */
export function usePagination(fetchFn, initialPerPage = 15) {
  const loading = ref(false)
  const data = ref([])
  const error = ref(null)
  
  const pagination = ref({
    page: 1,
    rowsPerPage: initialPerPage,
    rowsNumber: 0
  })

  const hasData = computed(() => data.value.length > 0)
  const isEmpty = computed(() => !loading.value && data.value.length === 0)

  async function cargar(extraParams = {}) {
    loading.value = true
    error.value = null
    
    try {
      const params = {
        page: pagination.value.page,
        per_page: pagination.value.rowsPerPage,
        ...extraParams
      }
      
      const result = await fetchFn(params)
      
      if (result.data) {
        // Respuesta paginada de Laravel
        data.value = result.data.data || result.data
        pagination.value.rowsNumber = result.data.total || result.data.length
      } else {
        data.value = []
        pagination.value.rowsNumber = 0
      }
      
      return result
    } catch (e) {
      error.value = e.message || 'Error al cargar datos'
      throw e
    } finally {
      loading.value = false
    }
  }

  function resetPagination() {
    pagination.value.page = 1
  }

  function onRequest(props) {
    pagination.value.page = props.pagination.page
    pagination.value.rowsPerPage = props.pagination.rowsPerPage
  }

  return {
    loading,
    data,
    error,
    pagination,
    hasData,
    isEmpty,
    cargar,
    resetPagination,
    onRequest
  }
}

export default usePagination

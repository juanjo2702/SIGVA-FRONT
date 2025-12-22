import { ref } from 'vue'

/**
 * Composable para manejar diálogos con formularios
 * @param {Object} initialForm - Objeto con valores iniciales del formulario
 */
export function useFormDialog(initialForm = {}) {
  const dialog = ref(false)
  const loading = ref(false)
  const editingId = ref(null)
  const form = ref({ ...initialForm })

  const isEditing = () => editingId.value !== null

  function open(data = null) {
    if (data) {
      editingId.value = data.id || null
      form.value = { ...data }
    } else {
      editingId.value = null
      form.value = { ...initialForm }
    }
    dialog.value = true
  }

  function close() {
    dialog.value = false
    reset()
  }

  function reset() {
    editingId.value = null
    form.value = { ...initialForm }
  }

  return {
    dialog,
    loading,
    editingId,
    form,
    isEditing,
    open,
    close,
    reset
  }
}

export default useFormDialog

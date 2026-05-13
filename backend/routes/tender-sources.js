import express from 'express'

const router = express.Router()

// Get all tender sources
router.get('/', async (req, res) => {
  try {
    const supabase = req.supabase
    const { data, error } = await supabase
      .from('tender_sources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create tender source
router.post('/', async (req, res) => {
  try {
    const supabase = req.supabase
    const { name, base_url, url, type, is_active } = req.body

    const { data, error } = await supabase
      .from('tender_sources')
      .insert([{ name, base_url: base_url || url, type, is_active }])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update tender source
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = req.supabase
    const updates = req.body

    const { data, error } = await supabase
      .from('tender_sources')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete tender source
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = req.supabase

    const { error } = await supabase
      .from('tender_sources')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: 'Tender source deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

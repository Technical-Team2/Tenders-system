import express from 'express'

const router = express.Router()

// Get all applications
router.get('/', async (req, res) => {
  try {
    const supabase = req.supabase
    const { data, error } = await supabase
      .from('applications')
      .select('*, tenders(*, tender_scores(*))')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create application
router.post('/', async (req, res) => {
  try {
    const supabase = req.supabase
    const { tender_id, status, notes, documents } = req.body

    const { data, error } = await supabase
      .from('applications')
      .insert([{ tender_id, status, notes, documents }])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update application
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = req.supabase
    const updates = req.body

    const { data, error } = await supabase
      .from('applications')
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

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = req.supabase

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: 'Application deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

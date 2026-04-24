import express from 'express'

const router = express.Router()

// Get all tenders
router.get('/', async (req, res) => {
  try {
    const { status, limit } = req.query
    const supabase = req.supabase

    let query = supabase
      .from('tenders')
      .select('*, tender_sources(*), tender_scores(*)')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (limit) {
      query = query.limit(Number(limit))
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get tender by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = req.supabase

    const { data, error } = await supabase
      .from('tenders')
      .select('*, tender_sources(*), tender_scores(*)')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Tender not found' })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create tender
router.post('/', async (req, res) => {
  try {
    const { title, description, deadline, source_url, status } = req.body
    const supabase = req.supabase

    const { data, error } = await supabase
      .from('tenders')
      .insert([{ title, description, deadline, source_url, status }])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update tender
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, deadline, source_url, status } = req.body
    const supabase = req.supabase

    const { data, error } = await supabase
      .from('tenders')
      .update({ title, description, deadline, source_url, status })
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

// Delete tender
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = req.supabase

    const { error } = await supabase
      .from('tenders')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: 'Tender deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

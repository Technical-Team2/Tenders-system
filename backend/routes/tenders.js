import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Get all tenders
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tenders')
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

// Create tender
router.post('/', async (req, res) => {
  try {
    const { title, description, deadline, source_url, status } = req.body

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

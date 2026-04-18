import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Get all tender sources
router.get('/', async (req, res) => {
  try {
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
    const { name, url, is_active } = req.body

    const { data, error } = await supabase
      .from('tender_sources')
      .insert([{ name, url, is_active }])
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
    const { name, url, is_active } = req.body

    const { data, error } = await supabase
      .from('tender_sources')
      .update({ name, url, is_active })
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

import { supabase } from './supabase'

export async function fetchFish() {
  const { data, error } = await supabase.from('fish').select('*')
  if (error) console.error(error)
  return data ?? []
}

export async function addFish({ name, species}) {
  const { error } = await supabase.from('fish').insert([{
    name,
    species,
    x: Math.random(),
    y: Math.random(),
  }])
  if (error) console.error(error)
}

let activeChannel = null

export function subscribeToFish(onUpdate) {
  if (activeChannel) {
    supabase.removeChannel(activeChannel)
  }

  activeChannel = supabase
    .channel('fish-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'fish' }, (payload) => {
      onUpdate(payload)
    })
    .subscribe()

  return activeChannel
}
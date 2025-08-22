'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

export default function RequireAuth() {
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.replace('/') // send to login if unauthenticated
    })()
  }, [router, pathname])
  return null
}

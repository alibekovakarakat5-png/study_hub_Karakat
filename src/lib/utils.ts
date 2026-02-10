import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

export function getScoreLevel(percentage: number): 'low' | 'medium' | 'high' {
  if (percentage >= 75) return 'high'
  if (percentage >= 50) return 'medium'
  return 'low'
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 75) return 'text-accent-600'
  if (percentage >= 50) return 'text-warning-600'
  return 'text-danger-600'
}

export function getScoreBgColor(percentage: number): string {
  if (percentage >= 75) return 'bg-accent-100 text-accent-700'
  if (percentage >= 50) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

export function minutesToHumanReadable(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours} ч`
  return `${hours} ч ${mins} мин`
}

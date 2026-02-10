import { useState, createContext, useContext, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within a <Tabs> parent.')
  }
  return context
}

export interface TabsProps {
  defaultValue: string
  value?: string
  onChange?: (value: string) => void
  children: ReactNode
  className?: string
}

export interface TabListProps {
  children: ReactNode
  className?: string
}

export interface TabProps {
  value: string
  children: ReactNode
  disabled?: boolean
  className?: string
}

export interface TabPanelProps {
  value: string
  children: ReactNode
  className?: string
}

const Tabs = ({
  defaultValue,
  value: controlledValue,
  onChange,
  children,
  className,
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeTab = controlledValue ?? internalValue

  const setActiveTab = useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    },
    [controlledValue, onChange],
  )

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabList = ({ children, className }: TabListProps) => (
  <div
    role="tablist"
    className={cn(
      'flex border-b border-gray-200 gap-0',
      className,
    )}
  >
    {children}
  </div>
)

TabList.displayName = 'TabList'

export const Tab = ({ value, children, disabled = false, className }: TabProps) => {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative px-4 py-2.5 text-sm font-medium transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'text-blue-600'
          : 'text-gray-500 hover:text-gray-700',
        className,
      )}
    >
      {children}
      {isActive && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-blue-600 rounded-full" />
      )}
    </button>
  )
}

Tab.displayName = 'Tab'

export const TabPanel = ({ value, children, className }: TabPanelProps) => {
  const { activeTab } = useTabsContext()

  if (activeTab !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn('py-4', className)}
    >
      {children}
    </div>
  )
}

TabPanel.displayName = 'TabPanel'

Tabs.displayName = 'Tabs'

export default Tabs

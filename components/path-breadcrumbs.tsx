"use client"

import React from "react"
import { ChevronRight, Home } from "lucide-react"

interface PathBreadcrumbsProps {
  currentPath: string
  onNavigate: (path: string) => void
  className?: string
  rootIcon?: React.ReactNode
  itemClassName?: string
  separatorClassName?: string
  currentClassName?: string
}

export function PathBreadcrumbs({
  currentPath,
  onNavigate,
  className = "breadcrumbs",
  rootIcon = <Home size={12} />,
  itemClassName = "breadcrumb-item",
  separatorClassName = "breadcrumb-separator",
  currentClassName = "breadcrumb-current",
}: PathBreadcrumbsProps) {
  // Handle root navigation
  const handleRootClick = () => {
    onNavigate("")
  }

  // Parse the path and create breadcrumb items
  const renderBreadcrumbItems = () => {
    if (!currentPath) {
      return null
    }

    const parts = currentPath.split("/").filter(Boolean)
    let accumulatedPath = ""

    return parts.map((part, index) => {
      accumulatedPath += (accumulatedPath ? "/" : "") + part
      const isLast = index === parts.length - 1
      const currentAccumulatedPath = accumulatedPath // Create a closure for the onClick handler

      return (
        <React.Fragment key={part + index}>
          <span className={separatorClassName}>
            <ChevronRight size={10} />
          </span>
          <span
            className={`${itemClassName} ${isLast ? currentClassName : ""} truncate max-w-[80px] inline-block`}
            onClick={() => onNavigate(currentAccumulatedPath)}
            title={part}
          >
            {part}
          </span>
        </React.Fragment>
      )
    })
  }

  return (
    <div className={`${className} flex items-center overflow-hidden w-full max-w-full`}>
      <span
        className={`${itemClassName} ${!currentPath ? currentClassName : ""} flex-shrink-0`}
        onClick={handleRootClick}
      >
        {rootIcon}
      </span>
      <div className="flex items-center overflow-hidden flex-1">{renderBreadcrumbItems()}</div>
    </div>
  )
}

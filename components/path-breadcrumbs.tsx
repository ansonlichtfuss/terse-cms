"use client"

import React from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

interface PathBreadcrumbsProps {
  currentPath: string
  onNavigate: (path: string) => void
  className?: string
  rootIcon?: React.ReactNode
  itemClassName?: string
  separatorClassName?: string
  currentClassName?: string
  useUrlRouting?: boolean
  type?: "files" | "media"
}

export function PathBreadcrumbs({
  currentPath,
  onNavigate,
  className = "breadcrumbs",
  rootIcon = <Home size={12} />,
  itemClassName = "breadcrumb-item",
  separatorClassName = "breadcrumb-separator",
  currentClassName = "breadcrumb-current",
  useUrlRouting = false,
  type = "files",
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

      if (useUrlRouting && type === "files") {
        return (
          <React.Fragment key={part + index}>
            <span className={separatorClassName}>
              <ChevronRight size={10} />
            </span>
            {isLast ? (
              <span
                className={`${itemClassName} ${isLast ? currentClassName : ""} truncate max-w-[80px] inline-block`}
                title={part}
              >
                {part}
              </span>
            ) : (
              <Link
                href={`/edit/${encodeURIComponent(currentAccumulatedPath)}`}
                className={`${itemClassName} truncate max-w-[80px] inline-block`}
                title={part}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(currentAccumulatedPath)
                  return true
                }}
              >
                {part}
              </Link>
            )}
          </React.Fragment>
        )
      }

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
      {useUrlRouting && type === "files" ? (
        <Link
          href="/edit"
          className={`${itemClassName} ${!currentPath ? currentClassName : ""} flex-shrink-0`}
          onClick={(e) => {
            e.preventDefault()
            handleRootClick()
            return true
          }}
        >
          {rootIcon}
        </Link>
      ) : (
        <span
          className={`${itemClassName} ${!currentPath ? currentClassName : ""} flex-shrink-0`}
          onClick={handleRootClick}
        >
          {rootIcon}
        </span>
      )}
      <div className="flex items-center overflow-hidden flex-1">{renderBreadcrumbItems()}</div>
    </div>
  )
}

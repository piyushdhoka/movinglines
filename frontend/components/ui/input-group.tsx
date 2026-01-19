"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// InputGroup - Main wrapper component

// InputGroup - Main wrapper component
const InputGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="input-group"
        className={cn(
            "group/input-group relative flex min-w-0 rounded-xl border border-white/10 bg-white/5 transition-colors focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10",
            className
        )}
        {...props}
    />
))
InputGroup.displayName = "InputGroup"

// InputGroupAddon - For icons, text, buttons alongside inputs
const inputGroupAddonVariants = cva(
    "flex items-center text-white/50 text-sm",
    {
        variants: {
            align: {
                "inline-start": "order-first pl-3",
                "inline-end": "order-last pr-3",
                "block-start": "absolute top-2 inset-x-3 justify-between",
                "block-end": "absolute bottom-2 inset-x-3 justify-between",
            },
        },
        defaultVariants: {
            align: "inline-start",
        },
    }
)

interface InputGroupAddonProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inputGroupAddonVariants> { }

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
    ({ className, align, ...props }, ref) => (
        <div
            ref={ref}
            data-slot="input-group-addon"
            className={cn(inputGroupAddonVariants({ align, className }))}
            {...props}
        />
    )
)
InputGroupAddon.displayName = "InputGroupAddon"

// InputGroupButton - Button within input groups
const inputGroupButtonVariants = cva(
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-white text-black hover:bg-white/90",
                ghost: "text-white/60 hover:text-white hover:bg-white/10",
                outline: "border border-white/20 text-white/80 hover:bg-white/5",
            },
            size: {
                xs: "h-6 px-2 text-xs",
                sm: "h-7 px-2.5 text-xs",
                "icon-xs": "h-6 w-6",
                "icon-sm": "h-7 w-7",
            },
        },
        defaultVariants: {
            variant: "ghost",
            size: "xs",
        },
    }
)

interface InputGroupButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof inputGroupButtonVariants> {
    asChild?: boolean
}

const InputGroupButton = React.forwardRef<
    HTMLButtonElement,
    InputGroupButtonProps
>(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            ref={ref}
            data-slot="input-group-button"
            className={cn(inputGroupButtonVariants({ variant, size, className }))}
            {...props}
        />
    )
})
InputGroupButton.displayName = "InputGroupButton"

// InputGroupText - For displaying text like "52% used"
const InputGroupText = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        data-slot="input-group-text"
        className={cn("text-xs text-white/40", className)}
        {...props}
    />
))
InputGroupText.displayName = "InputGroupText"

// InputGroupInput - Styled input for use within InputGroup
const InputGroupInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        data-slot="input-group-control"
        className={cn(
            "flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/30 outline-none",
            className
        )}
        {...props}
    />
))
InputGroupInput.displayName = "InputGroupInput"

// InputGroupTextarea - Styled textarea for use within InputGroup
const InputGroupTextarea = React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        data-slot="input-group-control"
        className={cn(
            "flex-1 min-h-24 resize-none bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/30 outline-none",
            className
        )}
        {...props}
    />
))
InputGroupTextarea.displayName = "InputGroupTextarea"

export {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupText,
    InputGroupInput,
    InputGroupTextarea,
}

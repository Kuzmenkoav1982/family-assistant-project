import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

const GradientSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const currentValue = Array.isArray(value) ? value[0] : 5;
  const max = props.max || 10;
  const percentage = (currentValue / max) * 100;
  
  const getThumbColor = (val: number) => {
    if (val <= 3) return 'border-red-500 shadow-red-200';
    if (val <= 6) return 'border-yellow-500 shadow-yellow-200';
    return 'border-green-500 shadow-green-200';
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-100" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb 
        className={cn(
          "block h-6 w-6 rounded-full border-3 bg-white ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg cursor-grab active:cursor-grabbing active:scale-110",
          getThumbColor(currentValue)
        )} 
      />
    </SliderPrimitive.Root>
  );
})
GradientSlider.displayName = "GradientSlider"

export { Slider, GradientSlider }
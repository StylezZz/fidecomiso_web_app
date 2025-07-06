"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { selectOrderById } from "@/store/orders/orders-selectors"
import { updateOrder } from "@/store/orders/orders-slice"
import { X, Plus, Tag } from "lucide-react"

// Colores predefinidos para las etiquetas
const TAG_COLORS = [
  "bg-red-100 text-red-800 border-red-200",
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
  "bg-orange-100 text-orange-800 border-orange-200",
]

// Etiquetas predefinidas comunes
const PREDEFINED_TAGS = [
  { name: "Urgente", color: TAG_COLORS[0] },
  { name: "VIP", color: TAG_COLORS[4] },
  { name: "Zona Norte", color: TAG_COLORS[1] },
  { name: "Zona Sur", color: TAG_COLORS[2] },
  { name: "Zona Este", color: TAG_COLORS[7] },
  { name: "Zona Oeste", color: TAG_COLORS[3] },
  { name: "Industrial", color: TAG_COLORS[5] },
  { name: "Residencial", color: TAG_COLORS[6] },
]

interface TagOrderDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TagOrderDialog({ orderId, open, onOpenChange }: TagOrderDialogProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const order = useAppSelector((state) => selectOrderById(state, orderId))

  const [newTag, setNewTag] = useState("")
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0])
  const [orderTags, setOrderTags] = useState<Array<{ name: string; color: string }>>([])
  const [isSaving, setIsSaving] = useState(false)

  // Cargar las etiquetas existentes del pedido cuando se abre el diálogo
  useEffect(() => {
    if (open && order) {
      setOrderTags(order.tags || [])
    }
  }, [open, order])

  if (!order) return null

  const handleAddTag = () => {
    if (!newTag.trim()) return

    // Verificar si la etiqueta ya existe
    if (orderTags.some((tag) => tag.name.toLowerCase() === newTag.toLowerCase())) {
      toast({
        title: "Etiqueta duplicada",
        description: "Esta etiqueta ya existe en el pedido",
        variant: "destructive",
      })
      return
    }

    // Agregar la nueva etiqueta
    setOrderTags([...orderTags, { name: newTag, color: selectedColor }])
    setNewTag("")

    // Cambiar al siguiente color para la próxima etiqueta
    const nextColorIndex = (TAG_COLORS.indexOf(selectedColor) + 1) % TAG_COLORS.length
    setSelectedColor(TAG_COLORS[nextColorIndex])
  }

  const handleRemoveTag = (tagName: string) => {
    setOrderTags(orderTags.filter((tag) => tag.name !== tagName))
  }

  const handleAddPredefinedTag = (tag: { name: string; color: string }) => {
    // Verificar si la etiqueta ya existe
    if (orderTags.some((t) => t.name.toLowerCase() === tag.name.toLowerCase())) {
      toast({
        title: "Etiqueta duplicada",
        description: "Esta etiqueta ya existe en el pedido",
        variant: "destructive",
      })
      return
    }

    setOrderTags([...orderTags, tag])
  }

  const handleSaveTags = async () => {
    setIsSaving(true)
    try {
      await dispatch(
        updateOrder({
          id: orderId,
          orderData: {
            tags: orderTags,
          },
        }),
      ).unwrap()

      toast({
        title: "Etiquetas guardadas",
        description: "Las etiquetas se han guardado correctamente",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las etiquetas",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Etiquetar Pedido</DialogTitle>
          <DialogDescription>
            Añada etiquetas al pedido #{order.id} para facilitar su categorización y búsqueda.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Etiquetas actuales */}
          <div>
            <h3 className="text-sm font-medium mb-2">Etiquetas actuales</h3>
            <div className="flex flex-wrap gap-2 min-h-10">
              {orderTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay etiquetas asignadas</p>
              ) : (
                orderTags.map((tag) => (
                  <Badge key={tag.name} className={`${tag.color} flex items-center gap-1 px-2 py-1 rounded-md`}>
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.name)}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Agregar nueva etiqueta */}
          <div>
            <h3 className="text-sm font-medium mb-2">Agregar nueva etiqueta</h3>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nueva etiqueta"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Añadir
              </Button>
            </div>

            {/* Selector de colores */}
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Seleccione un color:</p>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color, index) => (
                  <button
                    key={index}
                    className={`w-6 h-6 rounded-full ${color} ${selectedColor === color ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Etiquetas predefinidas */}
          <div>
            <h3 className="text-sm font-medium mb-2">Etiquetas predefinidas</h3>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map((tag) => (
                <Badge
                  key={tag.name}
                  className={`${tag.color} cursor-pointer hover:opacity-80`}
                  onClick={() => handleAddPredefinedTag(tag)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveTags} disabled={isSaving}>
            {isSaving ? (
              "Guardando..."
            ) : (
              <>
                <Tag className="mr-2 h-4 w-4" />
                Guardar Etiquetas
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

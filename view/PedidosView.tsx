"use client";

import { MainLayout } from '@/components/layout/main';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, MapPin, Calendar, Clock, Scale, Trash2, Upload, FileText } from "lucide-react";
import PedidosService from '@/services/orders.service';

interface Pedido {
  fecha: string;      // dd/mm/yyyy
  hora: string;       // HH:MM
  posX: string;       // posición X
  posY: string;       // posición Y
  cliente: string;    // c-999 -> cliente
  cantidad: string;   // 25m3 -> cantidad en m3
  horasLimite: string; // 4h -> horas límite
}

const PedidosView = () => {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  // Estados para el formulario
  const [formData, setFormData] = React.useState<Pedido>({
    fecha: '',
    hora: '',
    posX: '',
    posY: '',
    cliente: '',
    cantidad: '',
    horasLimite: '',
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitPedido = () => {
    // Validar que todos los campos estén llenos
    if (!formData.fecha || !formData.hora || !formData.posX || 
        !formData.posY || !formData.cliente || !formData.cantidad || !formData.horasLimite) {
      alert("Por favor, completa todos los campos del formulario");
      return;
    }

    if (pedidos.length >= 5) {
      alert("Máximo 5 pedidos permitidos");
      return;
    }

    // Agregar el pedido a la lista
    setPedidos(prev => [...prev, formData]);
    
    // Limpiar el formulario
    setFormData({
      fecha: '',
      hora: '',
      posX: '',
      posY: '',
      cliente: '',
      cantidad: '',
      horasLimite: '',
    });
  };

  const handleAddPedido = () => {
    if (pedidos.length >= 5) return;
    setPedidos([
      ...pedidos,
      {
        fecha: '',
        hora: '',
        posX: '',
        posY: '',
        cliente: '',
        cantidad: '',
        horasLimite: '',
      },
    ]);
  };

  const handlePedidoChange = (idx: number, field: string, value: any) => {
    setPedidos((prev) =>
      prev.map((pedido, i) =>
        i === idx
          ? { ...pedido, [field]: value }
          : pedido
      )
    );
  };

  const handleRemovePedido = (idx: number) => {
    setPedidos(prev => prev.filter((_, i) => i !== idx));
  };

  // Nueva función para manejar la subida de archivos de pedidos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar que sea un archivo .txt y contenga "ventas" en el nombre
    if (!file.name.toLowerCase().includes("ventas") || !file.name.endsWith(".txt")) {
      alert("Debes subir un archivo de pedidos en formato .txt que contenga 'ventas' en el nombre");
      return;
    }

    setUploadedFile(file);
  };

  // Función para procesar el archivo subido
  const processUploadedFile = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // Enviar el archivo al servicio de pedidos
      await PedidosService.postReadOrdersFile(uploadedFile);
      
      setUploadSuccess(true);
      alert("Archivo de pedidos cargado exitosamente");
      
      // Limpiar el archivo después de subirlo
      setUploadedFile(null);
      
    } catch (error) {
      console.error("Error al cargar el archivo:", error);
      alert("Error al cargar el archivo de pedidos");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Header Section */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                  Gestión de Pedidos
                </h1>
                <p className="text-slate-600 mt-1">Registra nuevos pedidos en el sistema o carga desde archivo</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-200">
                  <Package className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    {pedidos.length}/5 pedidos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Card para subir archivo */}
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Cargar Archivo de Pedidos
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Sube un archivo .txt con formato ventasYYYYMM.txt
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Input
                  id="file-pedidos"
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-pedidos")?.click()}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Seleccionar archivo
                </Button>
                
                {uploadedFile && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-600">{uploadedFile.name}</span>
                    <Button
                      onClick={processUploadedFile}
                      disabled={isUploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isUploading ? "Cargando..." : "Procesar archivo"}
                    </Button>
                  </div>
                )}
              </div>
              
              {uploadSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">✅ Archivo de pedidos cargado exitosamente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card para formulario de ingreso */}
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Formulario de Nuevo Pedido
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Completa todos los campos para agregar un pedido
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Fecha
                  </label>
                  <Input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formData.fecha}
                    onChange={(e) => handleFormChange('fecha', e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-xs text-slate-500">Formato: 25/07/2025</span>
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Hora
                  </label>
                  <Input
                    type="text"
                    placeholder="HH:MM"
                    value={formData.hora}
                    onChange={(e) => handleFormChange('hora', e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-xs text-slate-500">Formato: 14:30</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Posición X */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Posición X
                  </label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={formData.posX}
                    onChange={(e) => handleFormChange('posX', e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Posición Y */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Posición Y
                  </label>
                  <Input
                    type="number"
                    placeholder="49"
                    value={formData.posY}
                    onChange={(e) => handleFormChange('posY', e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Scale className="inline h-4 w-4 mr-1" />
                    Cantidad (m³)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="25"
                    value={formData.cantidad}
                    onChange={(e) => handleFormChange('cantidad', e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Horas Límite */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Horas límite
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="4"
                    value={formData.horasLimite}
                    onChange={(e) => handleFormChange('horasLimite', e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-xs text-slate-500">Ej: 4</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Cliente */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Package className="inline h-4 w-4 mr-1" />
                    Código de Cliente
                  </label>
                  <Input
                    type="text"
                    placeholder="c-999"
                    value={formData.cliente}
                    onChange={(e) => handleFormChange('cliente', e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-xs text-slate-500">Formato: c-XXX</span>
                </div>

                {/* Vista previa del formato */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vista previa del formato
                  </label>
                  <div className="p-3 bg-slate-50 rounded-md border">
                    <code className="text-sm text-orange-600">
                      {formData.fecha || "25/07/2025"} {formData.hora || "14:30"} - 
                      Pos({formData.posX || "2"},{formData.posY || "49"}) - 
                      {formData.cliente || "c-999"} - {formData.cantidad || "25"}m³ - {formData.horasLimite || "4"}h
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setFormData({
                    fecha: '', hora: '', posX: '', posY: '', 
                    cliente: '', cantidad: '', horasLimite: ''
                  })}
                >
                  Limpiar
                </Button>
                <Button
                  onClick={handleSubmitPedido}
                  disabled={pedidos.length >= 5}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Pedido ({pedidos.length}/5)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card original para la tabla */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Lista de Pedidos Registrados
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Pedidos agregados mediante el formulario ({pedidos.length}/5)
                    </CardDescription>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {pedidos.length > 0 && `${pedidos.length} pedido${pedidos.length > 1 ? 's' : ''} registrado${pedidos.length > 1 ? 's' : ''}`}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {pedidos.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No hay pedidos registrados</h3>
                  <p className="text-slate-500 mb-2">Usa el formulario de arriba para agregar pedidos o carga un archivo</p>
                  <div className="mb-6 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 max-w-md mx-auto">
                    <strong>Formato simplificado:</strong><br />
                    <code className="text-orange-600">25/07/2025 14:30 - Pos(2,49) - c-999 - 25m³ - 4h</code><br />
                    <span className="text-xs">Fecha, hora, posición, cliente, cantidad, límite</span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fecha
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Hora
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Posición (x,y)
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Cliente
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4" />
                            Cantidad (m³)
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Hrs Límite
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map((pedido, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4 font-mono text-sm">{pedido.fecha}</td>
                          <td className="py-4 px-4 font-mono text-sm">{pedido.hora}</td>
                          <td className="py-4 px-4 font-mono text-sm">({pedido.posX}, {pedido.posY})</td>
                          <td className="py-4 px-4 font-mono text-sm text-blue-600">{pedido.cliente}</td>
                          <td className="py-4 px-4 font-mono text-sm">{pedido.cantidad} m³</td>
                          <td className="py-4 px-4 font-mono text-sm">{pedido.horasLimite}h</td>
                          <td className="py-4 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemovePedido(idx)}
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

export default PedidosView
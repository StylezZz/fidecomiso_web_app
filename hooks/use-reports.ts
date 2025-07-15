"use client";

import { useState, useEffect, useCallback } from 'react';
import ReportsService from '@/services/reports.service';
import { ReportsData } from '@/interfaces/reports/reports.interface';

export function useReports() {
  const [data, setData] = useState<ReportsData>({
    incidentes: null,
    cumplimientoEntregas: null,
    pedidosDivididos: null,
    pedidosCompletos: null,
    loading: {
      incidentes: false,
      cumplimientoEntregas: false,
      pedidosDivididos: false,
      pedidosCompletos: false,
    },
    error: {
      incidentes: null,
      cumplimientoEntregas: null,
      pedidosDivididos: null,
      pedidosCompletos: null,
    }
  });

  // ✅ CARGAR INCIDENTES
  const loadIncidentes = useCallback(async () => {
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, incidentes: true },
      error: { ...prev.error, incidentes: null }
    }));

    try {
      const incidentes = await ReportsService.getIncidentes();
      setData(prev => ({
        ...prev,
        incidentes,
        loading: { ...prev.loading, incidentes: false }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // ✅ SOLO MOSTRAR ERROR EN CONSOLA SI NO ES "NO SIMULACIÓN"
      if (errorMessage !== 'Aún no se ha iniciado una simulación') {
        console.error('Error al cargar incidentes:', error);
      }
      
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, incidentes: false },
        error: { ...prev.error, incidentes: errorMessage }
      }));
    }
  }, []);

  // ✅ CARGAR CUMPLIMIENTO ENTREGAS
  const loadCumplimientoEntregas = useCallback(async () => {
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, cumplimientoEntregas: true },
      error: { ...prev.error, cumplimientoEntregas: null }
    }));

    try {
      const cumplimientoEntregas = await ReportsService.getCumplimientoEntregas();
      setData(prev => ({
        ...prev,
        cumplimientoEntregas,
        loading: { ...prev.loading, cumplimientoEntregas: false }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // ✅ SOLO MOSTRAR ERROR EN CONSOLA SI NO ES "NO SIMULACIÓN"
      if (errorMessage !== 'Aún no se ha iniciado una simulación') {
        console.error('Error al cargar cumplimiento de entregas:', error);
      }
      
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, cumplimientoEntregas: false },
        error: { ...prev.error, cumplimientoEntregas: errorMessage }
      }));
    }
  }, []);

  // ✅ CARGAR PEDIDOS DIVIDIDOS
  const loadPedidosDivididos = useCallback(async () => {
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, pedidosDivididos: true },
      error: { ...prev.error, pedidosDivididos: null }
    }));

    try {
      const pedidosDivididos = await ReportsService.getPedidosDivididos();
      setData(prev => ({
        ...prev,
        pedidosDivididos,
        loading: { ...prev.loading, pedidosDivididos: false }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // ✅ SOLO MOSTRAR ERROR EN CONSOLA SI NO ES "NO SIMULACIÓN"
      if (errorMessage !== 'Aún no se ha iniciado una simulación') {
        console.error('Error al cargar pedidos divididos:', error);
      }
      
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, pedidosDivididos: false },
        error: { ...prev.error, pedidosDivididos: errorMessage }
      }));
    }
  }, []);

  // ✅ CARGAR PEDIDOS COMPLETOS
  const loadPedidosCompletos = useCallback(async () => {
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, pedidosCompletos: true },
      error: { ...prev.error, pedidosCompletos: null }
    }));

    try {
      const pedidosCompletos = await ReportsService.getPedidosCompletos();
      setData(prev => ({
        ...prev,
        pedidosCompletos,
        loading: { ...prev.loading, pedidosCompletos: false }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // ✅ SOLO MOSTRAR ERROR EN CONSOLA SI NO ES "NO SIMULACIÓN"
      if (errorMessage !== 'Aún no se ha iniciado una simulación') {
        console.error('Error al cargar pedidos completos:', error);
      }
      
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, pedidosCompletos: false },
        error: { ...prev.error, pedidosCompletos: errorMessage }
      }));
    }
  }, []);

  // ✅ CARGAR TODOS LOS REPORTES (ACTUALIZADO)
  const loadAllReports = useCallback(async () => {
    await Promise.all([
      loadIncidentes(),
      loadCumplimientoEntregas(),
      loadPedidosDivididos(),
      loadPedidosCompletos()
    ]);
  }, [loadIncidentes, loadCumplimientoEntregas, loadPedidosDivididos, loadPedidosCompletos]);

  // ✅ REFRESCAR DATOS
  const refresh = useCallback(() => {
    loadAllReports();
  }, [loadAllReports]);

  // ✅ CARGAR DATOS AL MONTAR
  useEffect(() => {
    loadAllReports();
  }, [loadAllReports]);

  return {
    data,
    loadIncidentes,
    loadCumplimientoEntregas,
    loadPedidosDivididos,
    loadPedidosCompletos,
    loadAllReports,
    refresh,
    isLoading: Object.values(data.loading).some(loading => loading),
    hasError: Object.values(data.error).some(error => error !== null)
  };
} 
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  FileText,
  HardHat,
  Package,
  ShoppingCart,
  Layers,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building,
  UserCheck,
  CheckSquare,
} from 'lucide-react';
import {
  ProductionOrder,
  Product,
  RawMaterial,
  WorkCenter,
  SalesOrder,
  Partner,
} from '../types/erp';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMinutes,
} from '../utils/formatters';

export type ReportType =
  | 'op_sheet'
  | 'pcp_summary'
  | 'stock_needs'
  | 'orders_list'
  | 'bom_sheet';

interface Props {
  productionOrders: ProductionOrder[];
  products: Product[];
  materials: RawMaterial[];
  workCenters: WorkCenter[];
  orders: SalesOrder[];
  partners: Partner[];
  preselectedOPId?: string;
}

export const ReportsModule: React.FC<Props> = ({
  productionOrders,
  products,
  materials,
  workCenters,
  orders,
  partners,
  preselectedOPId,
}) => {
  const [reportType, setReportType] = useState<ReportType>(
    preselectedOPId ? 'op_sheet' : 'op_sheet'
  );
  const [selectedOPId, setSelectedOPId] = useState<string>(
    preselectedOPId || (productionOrders[0]?.id || '')
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [pcpStatusFilter, setPcpStatusFilter] = useState<string>('all');

  const handlePrint = () => {
    window.print();
  };

  const selectedOP = productionOrders.find((op) => op.id === selectedOPId);
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Relatório de Estoque e Compras
  const lowStockMaterials = materials.filter((m) => m.currentStock <= m.minStock);

  return (
    <div className="space-y-6">
      {/* Top Banner & Print Controls (Hidden on Print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Printer className="w-6 h-6 text-indigo-600" />
              <span>Central de Relatórios &amp; Impressão Industrial</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Emita folhas de chão de fábrica, relatórios de PCP, ordens de compra de insumos e fichas técnicas formatados para papel A4 e PDF.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório / Salvar em PDF</span>
          </button>
        </div>

        {/* Tipo de Relatório */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'op_sheet', label: 'Ficha da OP (Chão de Fábrica)', icon: HardHat },
            { id: 'pcp_summary', label: 'Relatório Geral do PCP', icon: FileText },
            { id: 'stock_needs', label: 'Necessidade de Compras & Estoque', icon: Package },
            { id: 'orders_list', label: 'Carteira de Pedidos de Venda', icon: ShoppingCart },
            { id: 'bom_sheet', label: 'Ficha Técnica de Engenharia (BOM)', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = reportType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setReportType(item.id as ReportType)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filtros dinâmicos conforme o relatório escolhido */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          {reportType === 'op_sheet' && (
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-slate-700">Selecione a Ordem de Produção:</label>
              <select
                value={selectedOPId}
                onChange={(e) => setSelectedOPId(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
              >
                {productionOrders.map((op) => {
                  const prod = products.find((p) => p.id === op.productId);
                  return (
                    <option key={op.id} value={op.id}>
                      {op.opNumber} - {prod?.name} ({op.quantity} un) - {op.status}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {reportType === 'bom_sheet' && (
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-slate-700">Selecione o Produto:</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'pcp_summary' && (
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-slate-700">Status das OPs:</label>
              <select
                value={pcpStatusFilter}
                onChange={(e) => setPcpStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Todas as Ordens</option>
                <option value="in_production">Em Produção</option>
                <option value="waiting">Aguardando Início</option>
                <option value="completed">Concluídas</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DE IMPRESSÃO FORMAL (A4 READY) */}
      <div className="print-container bg-white p-8 rounded-2xl border border-slate-300 shadow-sm max-w-4xl mx-auto text-slate-900 text-xs leading-normal">
        {/* Cabeçalho Padrão do Relatório */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg text-slate-900 tracking-tight">
                OFICINA &amp; MANUFATURA ARTEFATOS LTDA
              </span>
              <span className="text-[10px] px-2 py-0.5 border border-slate-900 font-bold uppercase">
                PCP Oficial
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Sistema de Planejamento e Controle da Produção • CNPJ: 15.670.321/0001-05
            </p>
            <p className="text-[10px] text-slate-500">
              Rua da Indústria, 1200 - São Paulo, SP • Tel: (11) 3211-7788
            </p>
          </div>

          <div className="text-right text-[11px] text-slate-600">
            <p>
              <strong>Data de Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p>
              <strong>Horário:</strong> {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Via do Documento: Original</p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RELATÓRIO 1: FICHA DE CHÃO DE FÁBRICA (ORDEM DE PRODUÇÃO)          */}
        {/* ------------------------------------------------------------------ */}
        {reportType === 'op_sheet' && (
          selectedOP ? (
            <div className="space-y-6">
              {/* Título do Relatório */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase">
                    Ficha de Chão de Fábrica • {selectedOP.opNumber}
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Roteiro de Fabricação, Separação de Matérias-Primas e Controle Operacional
                  </p>
                </div>
                <div className="text-right font-mono font-bold text-xs bg-slate-100 px-3 py-1 rounded border border-slate-300">
                  STATUS: {selectedOP.status.toUpperCase()}
                </div>
              </div>

              {/* Informações Principais da OP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-slate-300 p-3 rounded-lg bg-slate-50/50">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Produto Acabado</span>
                  <span className="font-bold text-slate-900">
                    {products.find((p) => p.id === selectedOP.productId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Lote a Fabricar</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {selectedOP.quantity} UNIDADES
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Posto de Trabalho</span>
                  <span className="font-bold text-slate-800">
                    {workCenters.find((w) => w.id === selectedOP.workCenterId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Prazo de Entrega</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatDate(selectedOP.scheduledEndDate)}
                  </span>
                </div>
              </div>

              {/* Pedido e Cliente vinculado */}
              {selectedOP.orderId && (
                <div className="border border-slate-200 p-2.5 rounded-lg text-xs bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-600">Vinculado ao Pedido:</span>{' '}
                    <strong className="font-mono text-slate-900">
                      {orders.find((o) => o.id === selectedOP.orderId)?.orderNumber}
                    </strong>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Cliente:</span>{' '}
                    <strong className="text-slate-900">
                      {partners.find((p) => p.id === orders.find((o) => o.id === selectedOP.orderId)?.customerId)?.name || 'Cliente Direto'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Tabela de Matérias-Primas Requeridas (Para o Almoxarifado Separar) */}
              <div className="print-avoid-break space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-xs text-slate-800 flex items-center space-x-1.5">
                  <Package className="w-4 h-4 text-slate-700" />
                  <span>1. Requisição de Matérias-Primas (Checklist do Almoxarifado)</span>
                </h4>

                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="px-3 py-1.5 w-24">Código</th>
                      <th className="px-3 py-1.5">Descrição do Insumo</th>
                      <th className="px-3 py-1.5 w-28">Qtd por Peça</th>
                      <th className="px-3 py-1.5 w-32">Total Requerido</th>
                      <th className="px-3 py-1.5 w-28 text-center">Separado [ ]</th>
                      <th className="px-3 py-1.5 w-32 text-center">Visto Almoxarife</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedOP.materialsSnapshot.map((mat) => (
                      <tr key={mat.materialId}>
                        <td className="px-3 py-2 font-mono">{mat.materialCode}</td>
                        <td className="px-3 py-2 font-medium">{mat.materialName}</td>
                        <td className="px-3 py-2 font-mono">
                          {mat.unitQty} {mat.unit}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">
                          {mat.totalRequiredQty} {mat.unit}
                        </td>
                        <td className="px-3 py-2 text-center border-l border-slate-200">
                          <span className="inline-block w-4 h-4 border border-slate-400 rounded-xs"></span>
                        </td>
                        <td className="px-3 py-2 text-center border-l border-slate-200 text-slate-400">
                          ________________
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Roteiro de Fabricação e Apontamento de Tempos */}
              <div className="print-avoid-break space-y-2 pt-2">
                <h4 className="font-bold uppercase tracking-wider text-xs text-slate-800 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-slate-700" />
                  <span>2. Apontamento de Tempos e Operação de Fabricação</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-slate-300 p-3 rounded-lg">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Tempo Previsto (BOM)</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatMinutes(selectedOP.estimatedTimeMinutes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Início Efetivo</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedOP.actualStartDate ? formatDateTime(selectedOP.actualStartDate) : '__:__  ___/___'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Término Efetivo</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedOP.actualEndDate ? formatDateTime(selectedOP.actualEndDate) : '__:__  ___/___'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Tempo Real Gasto</span>
                    <span className="font-mono font-bold text-indigo-700 text-sm">
                      {selectedOP.actualTimeMinutes ? formatMinutes(selectedOP.actualTimeMinutes) : '_______ min'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Observações da Ordem */}
              {selectedOP.notes && (
                <div className="border border-slate-200 p-2.5 rounded-lg text-xs bg-slate-50">
                  <span className="font-bold uppercase text-[10px] text-slate-600 block mb-0.5">
                    Instruções Especiais ao Operador:
                  </span>
                  <p className="text-slate-800">{selectedOP.notes}</p>
                </div>
              )}

              {/* Bloco de Assinaturas & Qualidade */}
              <div className="print-avoid-break pt-6 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-mono text-[11px] text-slate-400">
                    &nbsp;
                  </div>
                  <p className="font-bold text-slate-800">Operador Responsável</p>
                  <p className="text-[10px] text-slate-500">Chão de Fábrica</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-mono text-[11px] text-slate-400">
                    &nbsp;
                  </div>
                  <p className="font-bold text-slate-800">Controle de Qualidade</p>
                  <p className="text-[10px] text-slate-500">Inspeção Final [ ] Aprovado</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-mono text-[11px] text-slate-400">
                    &nbsp;
                  </div>
                  <p className="font-bold text-slate-800">Supervisor de Produção</p>
                  <p className="text-[10px] text-slate-500">Liberação para Expedição</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-10 text-slate-400">Selecione uma ordem de produção para visualizar.</p>
          )
        )}

        {/* ------------------------------------------------------------------ */}
        {/* RELATÓRIO 2: RELATÓRIO GERAL DO PCP & PRODUÇÃO                     */}
        {/* ------------------------------------------------------------------ */}
        {reportType === 'pcp_summary' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Relatório Analítico de Planejamento e Controle da Produção (PCP)
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Acompanhamento de Ordens, Prazos e Confronto entre Tempo Previsto vs Realizado
                </p>
              </div>
            </div>

            {/* Quadro de Métricas Consolidadas */}
            <div className="grid grid-cols-4 gap-3 border border-slate-300 p-3 rounded-lg bg-slate-50">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total de OPs</span>
                <span className="font-bold text-base text-slate-900">{productionOrders.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Em Fabricação</span>
                <span className="font-bold text-base text-sky-700">
                  {productionOrders.filter((op) => op.status === 'in_production').length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Concluídas</span>
                <span className="font-bold text-base text-emerald-700">
                  {productionOrders.filter((op) => op.status === 'completed').length}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Horas Programadas</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  {Math.round((productionOrders.reduce((acc, o) => acc + (o.estimatedTimeMinutes || 0), 0) / 60) * 10) / 10}h
                </span>
              </div>
            </div>

            {/* Tabela de Ordens */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="px-3 py-2">OP</th>
                  <th className="px-3 py-2">Produto</th>
                  <th className="px-3 py-2">Qtd</th>
                  <th className="px-3 py-2">Posto</th>
                  <th className="px-3 py-2">Prazo</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Previsto</th>
                  <th className="px-3 py-2">Realizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {productionOrders
                  .filter((op) => (pcpStatusFilter === 'all' ? true : op.status === pcpStatusFilter))
                  .map((op) => {
                    const prod = products.find((p) => p.id === op.productId);
                    const wc = workCenters.find((w) => w.id === op.workCenterId);
                    return (
                      <tr key={op.id}>
                        <td className="px-3 py-1.5 font-mono font-bold">{op.opNumber}</td>
                        <td className="px-3 py-1.5 font-medium">{prod ? prod.name : 'Produto'}</td>
                        <td className="px-3 py-1.5 font-mono">{op.quantity} un</td>
                        <td className="px-3 py-1.5">{wc ? wc.name : '-'}</td>
                        <td className="px-3 py-1.5 font-mono">{formatDate(op.scheduledEndDate)}</td>
                        <td className="px-3 py-1.5 uppercase font-bold text-[10px]">{op.status}</td>
                        <td className="px-3 py-1.5 font-mono">{formatMinutes(op.estimatedTimeMinutes)}</td>
                        <td className="px-3 py-1.5 font-mono font-bold text-slate-900">
                          {op.actualTimeMinutes ? formatMinutes(op.actualTimeMinutes) : '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* RELATÓRIO 3: NECESSIDADE DE COMPRAS & ESTOQUE                      */}
        {/* ------------------------------------------------------------------ */}
        {reportType === 'stock_needs' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Relatório de Inventário &amp; Necessidade de Compras de Insumos
              </h3>
              <p className="text-slate-500 text-[11px]">
                Posição física de estoque, insumos críticos e fornecedores de referência para cotação
              </p>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Matéria-Prima</th>
                  <th className="px-3 py-2">Estoque Atual</th>
                  <th className="px-3 py-2">Estoque Mínimo</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Sugestão de Compra</th>
                  <th className="px-3 py-2">Fornecedor / Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {materials.map((m) => {
                  const supplier = partners.find((p) => p.id === m.supplierId);
                  const isCritical = m.currentStock <= 0;
                  const isLow = m.currentStock <= m.minStock && !isCritical;
                  const suggestQty = isLow || isCritical ? Math.max(0, m.minStock * 2 - m.currentStock) : 0;

                  return (
                    <tr key={m.id} className={isCritical ? 'bg-rose-50/60' : isLow ? 'bg-amber-50/40' : ''}>
                      <td className="px-3 py-1.5 font-mono font-bold">{m.code}</td>
                      <td className="px-3 py-1.5 font-medium">{m.name}</td>
                      <td className="px-3 py-1.5 font-mono font-bold">
                        {m.currentStock} {m.unit}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-slate-600">
                        {m.minStock} {m.unit}
                      </td>
                      <td className="px-3 py-1.5 font-bold text-[10px] uppercase">
                        {isCritical ? (
                          <span className="text-rose-700">Estoque Zerado</span>
                        ) : isLow ? (
                          <span className="text-amber-700">Abaixo do Mínimo</span>
                        ) : (
                          <span className="text-emerald-700">Normal</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 font-mono font-bold text-slate-900">
                        {suggestQty > 0 ? `${suggestQty} ${m.unit}` : '-'}
                      </td>
                      <td className="px-3 py-1.5 text-slate-600">
                        {supplier ? `${supplier.name} (${supplier.phone || supplier.email})` : 'Não informado'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* RELATÓRIO 4: CARTEIRA DE PEDIDOS DE VENDA                          */}
        {/* ------------------------------------------------------------------ */}
        {reportType === 'orders_list' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Relatório da Carteira de Pedidos de Venda
              </h3>
              <p className="text-slate-500 text-[11px]">
                Programação de entregas aos clientes e valores faturados / previstos
              </p>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="px-3 py-2">Nº Pedido</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Data Emissão</th>
                  <th className="px-3 py-2">Data de Entrega</th>
                  <th className="px-3 py-2">Itens Solicitados</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => {
                  const customer = partners.find((p) => p.id === order.customerId);
                  return (
                    <tr key={order.id}>
                      <td className="px-3 py-2 font-mono font-bold">{order.orderNumber}</td>
                      <td className="px-3 py-2 font-medium">{customer ? customer.name : 'Cliente'}</td>
                      <td className="px-3 py-2 font-mono">{formatDate(order.orderDate)}</td>
                      <td className="px-3 py-2 font-mono font-bold">{formatDate(order.deliveryDate)}</td>
                      <td className="px-3 py-2">
                        {order.items.map((it) => {
                          const p = products.find((prod) => prod.id === it.productId);
                          return (
                            <div key={it.id} className="text-[11px]">
                              {it.quantity}x {p?.name}
                            </div>
                          );
                        })}
                      </td>
                      <td className="px-3 py-2 uppercase font-bold text-[10px]">{order.status}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                <tr>
                  <td colSpan={6} className="px-3 py-2 text-right">
                    Total Geral da Carteira:
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-sm text-slate-900">
                    {formatCurrency(orders.reduce((acc, o) => acc + o.totalAmount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* RELATÓRIO 5: FICHA TÉCNICA DE ENGENHARIA (BOM DE PRODUTO)         */}
        {/* ------------------------------------------------------------------ */}
        {reportType === 'bom_sheet' && (
          selectedProduct ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase">
                    Ficha Técnica de Engenharia • {selectedProduct.name}
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Código: <span className="font-mono font-bold">{selectedProduct.code}</span> • Categoria: {selectedProduct.category}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-semibold text-slate-600">Tempo de Fabricação:</span>{' '}
                  <strong className="font-mono text-slate-900">
                    {formatMinutes(selectedProduct.processTimeMinutes)} / {selectedProduct.processTimeUnit === 'unit' ? 'un' : 'lote'}
                  </strong>
                </div>
              </div>

              {/* Tabela de Insumos da BOM */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-xs text-slate-800">
                  Estrutura de Matérias-Primas por Unidade Fabricada (BOM)
                </h4>

                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="px-3 py-2">Código Insumo</th>
                      <th className="px-3 py-2">Descrição da Matéria-Prima</th>
                      <th className="px-3 py-2">Consumo por Unidade</th>
                      <th className="px-3 py-2">Custo Unitário</th>
                      <th className="px-3 py-2 text-right">Subtotal na Peça</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedProduct.components.map((c) => {
                      const mat = materials.find((m) => m.id === c.materialId);
                      const cost = mat ? c.quantityNeeded * mat.unitCost : 0;
                      return (
                        <tr key={c.materialId}>
                          <td className="px-3 py-2 font-mono font-semibold">{mat ? mat.code : 'N/A'}</td>
                          <td className="px-3 py-2 font-medium">{mat ? mat.name : 'Insumo'}</td>
                          <td className="px-3 py-2 font-mono font-bold">
                            {c.quantityNeeded} {mat ? mat.unit : ''}
                          </td>
                          <td className="px-3 py-2 font-mono">{mat ? formatCurrency(mat.unitCost) : '-'}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold">
                            {formatCurrency(cost)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-right">
                        Custo Estimado de Matéria-Prima por Unidade:
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm text-emerald-800">
                        {formatCurrency(
                          selectedProduct.components.reduce((acc, c) => {
                            const mat = materials.find((m) => m.id === c.materialId);
                            return acc + (mat ? c.quantityNeeded * mat.unitCost : 0);
                          }, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedProduct.notes && (
                <div className="border border-slate-200 p-3 rounded-lg text-xs bg-slate-50">
                  <span className="font-bold uppercase text-[10px] text-slate-600 block mb-0.5">
                    Orientações de Engenharia e Montagem:
                  </span>
                  <p className="text-slate-800">{selectedProduct.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-10 text-slate-400">Selecione um produto cadastrado.</p>
          )
        )}

        {/* Rodapé Padrão do Relatório */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Mini-ERP Manufatura • Planejamento e Controle da Produção</span>
          <span>Página 1 de 1 • Emitido Eletronicamente</span>
        </div>
      </div>
    </div>
  );
};

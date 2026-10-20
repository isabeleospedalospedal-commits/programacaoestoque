/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  HardHat,
  ShoppingCart,
  Layers,
  Package,
  Calendar,
  Building,
  Clock,
  CheckSquare,
  TrendingDown,
  Download,
} from 'lucide-react';
import {
  ERPDatabase,
  ProductionOrder,
  SalesOrder,
  Product,
  RawMaterial,
  WorkCenter,
  Partner,
} from '../types/erp';
import { formatCurrency, formatDate, formatDateTime, formatMinutes } from '../utils/formatters';

export type ReportType = 'op' | 'order' | 'product_bom' | 'stock' | 'pcp_summary';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  database: ERPDatabase;
  initialType?: ReportType;
  initialItemId?: string;
}

export const ReportsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  database,
  initialType = 'op',
  initialItemId,
}) => {
  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [selectedOPId, setSelectedOPId] = useState<string>(
    initialType === 'op' && initialItemId ? initialItemId : database.productionOrders[0]?.id || ''
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialType === 'order' && initialItemId ? initialItemId : database.orders[0]?.id || ''
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialType === 'product_bom' && initialItemId ? initialItemId : database.products[0]?.id || ''
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const selectedOP = database.productionOrders.find((op) => op.id === selectedOPId);
  const selectedOrder = database.orders.find((o) => o.id === selectedOrderId);
  const selectedProduct = database.products.find((p) => p.id === selectedProductId);

  // Relatório de reposição de estoque
  const lowStockItems = database.materials.filter((m) => m.currentStock <= m.minStock);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header no-print */}
        <div className="no-print px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Central de Relatórios &amp; Impressão</h3>
              <p className="text-[11px] text-slate-500">
                Gere fichas de chão de fábrica, ordens de serviço, pedidos e espelhos de estoque
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar de seleção do tipo de relatório no-print */}
        <div className="no-print px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {[
              { id: 'op', label: 'Ordem de Produção (OP)', icon: HardHat },
              { id: 'order', label: 'Pedido de Venda', icon: ShoppingCart },
              { id: 'product_bom', label: 'Ficha Técnica (BOM)', icon: Layers },
              { id: 'stock', label: 'Reposição de Estoque', icon: Package },
              { id: 'pcp_summary', label: 'Resumo Geral PCP', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = reportType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id as ReportType)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold transition ${
                    active ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Seletores específicos */}
          {reportType === 'op' && (
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Selecionar OP:</span>
              <select
                value={selectedOPId}
                onChange={(e) => setSelectedOPId(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded-lg bg-white font-mono text-xs"
              >
                {database.productionOrders.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.opNumber} - {database.products.find((p) => p.id === op.productId)?.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'order' && (
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Selecionar Pedido:</span>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded-lg bg-white font-mono text-xs"
              >
                {database.orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {database.partners.find((p) => p.id === o.customerId)?.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'product_bom' && (
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Selecionar Produto:</span>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded-lg bg-white text-xs"
              >
                {database.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* PRINTABLE SHEET AREA */}
        <div className="p-8 overflow-y-auto bg-slate-50 print:bg-white print:p-0 flex-1">
          <div className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0 text-slate-800 text-xs">
            {/* Header da Empresa no Relatório */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  OFICINA &amp; MANUFATURA ARTEFATOS LTDA
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Planejamento e Controle da Produção (PCP) • CNPJ: 12.345.678/0001-99
                </p>
                <p className="text-[11px] text-slate-500">
                  São Paulo - SP • contato@manufatura.ind.br • Tel: (11) 3222-1000
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-mono font-bold rounded text-xs uppercase tracking-wider">
                  {reportType === 'op' && 'Ordem de Produção'}
                  {reportType === 'order' && 'Espelho de Pedido de Venda'}
                  {reportType === 'product_bom' && 'Ficha Técnica do Produto'}
                  {reportType === 'stock' && 'Relatório de Reposição de Estoque'}
                  {reportType === 'pcp_summary' && 'Relatório Executivo de PCP'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Emissão: {formatDateTime(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* 1. RELATÓRIO DE ORDEM DE PRODUÇÃO (CHÃO DE FÁBRICA) */}
            {reportType === 'op' && selectedOP && (
              <div className="space-y-6">
                {/* Resumo da OP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Número da OP</span>
                    <span className="text-base font-black font-mono text-slate-900">{selectedOP.opNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pedido de Venda</span>
                    <span className="text-sm font-bold font-mono text-slate-800">
                      {selectedOP.orderId
                        ? database.orders.find((o) => o.id === selectedOP.orderId)?.orderNumber || '-'
                        : 'Estoque / Avulsa'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Posto de Trabalho</span>
                    <span className="text-sm font-bold text-slate-800">
                      {database.workCenters.find((w) => w.id === selectedOP.workCenterId)?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Prazo de Conclusão</span>
                    <span className="text-sm font-bold text-slate-800">{formatDate(selectedOP.scheduledEndDate)}</span>
                  </div>
                </div>

                {/* Produto e Lote */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Produto a Fabricar</span>
                    <span className="text-sm font-black text-slate-900">
                      Lote: {selectedOP.quantity} unidades
                    </span>
                  </div>
                  <p className="text-base font-bold text-slate-900">
                    {database.products.find((p) => p.id === selectedOP.productId)?.name}
                  </p>
                  <p className="text-slate-500 font-mono text-xs">
                    Código: {database.products.find((p) => p.id === selectedOP.productId)?.code}
                  </p>
                  <div className="mt-2 text-xs text-slate-600 flex items-center space-x-4">
                    <span>
                      Tempo Previsto de Processo:{' '}
                      <strong className="font-mono text-slate-900">{formatMinutes(selectedOP.estimatedTimeMinutes)}</strong>
                    </span>
                    <span>
                      Status Atual:{' '}
                      <strong className="uppercase text-slate-900">{selectedOP.status}</strong>
                    </span>
                  </div>
                </div>

                {/* Checklist de Matérias-Primas para o Chão de Fábrica */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider flex items-center justify-between">
                    <span>1. Lista de Materiais &amp; Componentes Requeridos</span>
                    <span className="text-[10px] text-slate-500 normal-case font-normal">
                      Conferência do Almoxarifado / Chão de Fábrica
                    </span>
                  </h4>
                  <table className="w-full text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-r border-slate-200 w-12 text-center">[ OK ]</th>
                        <th className="p-2 border-r border-slate-200">Código</th>
                        <th className="p-2 border-r border-slate-200">Matéria-Prima / Especificação</th>
                        <th className="p-2 border-r border-slate-200 text-right">Qtd / Peça</th>
                        <th className="p-2 text-right">Qtd Total Separada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {selectedOP.materialsSnapshot.map((m, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-center border-r border-slate-200 font-sans text-slate-300">
                            [ &nbsp; ]
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-600">{m.materialCode}</td>
                          <td className="p-2 border-r border-slate-200 font-sans font-semibold text-slate-800">
                            {m.materialName}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right text-slate-600">
                            {m.unitQty} {m.unit}
                          </td>
                          <td className="p-2 text-right font-bold text-slate-900">
                            {m.totalRequiredQty} {m.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Campo de Apontamento Chão de Fábrica */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                    2. Apontamento de Execução e Qualidade
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="border border-dashed border-slate-300 p-3 rounded">
                      <p className="font-semibold text-slate-700">Data e Hora de Início:</p>
                      <p className="font-mono text-slate-500 mt-3">____/____/________ às ____:____</p>
                    </div>
                    <div className="border border-dashed border-slate-300 p-3 rounded">
                      <p className="font-semibold text-slate-700">Data e Hora de Término:</p>
                      <p className="font-mono text-slate-500 mt-3">____/____/________ às ____:____</p>
                    </div>
                    <div className="border border-dashed border-slate-300 p-3 rounded">
                      <p className="font-semibold text-slate-700">Tempo Real Gasto (min):</p>
                      <p className="font-mono text-slate-500 mt-3">Total: ____________ min</p>
                    </div>
                  </div>
                  {selectedOP.notes && (
                    <p className="text-slate-600 text-xs">
                      <strong>Instruções de Fabricação:</strong> {selectedOP.notes}
                    </p>
                  )}
                </div>

                {/* Assinaturas */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                      Operador Responsável / Turno
                    </div>
                    <p className="text-[10px] text-slate-400">Assinatura</p>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                      Supervisor de PCP &amp; Controle de Qualidade
                    </div>
                    <p className="text-[10px] text-slate-400">Assinatura / Liberação</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. RELATÓRIO DE PEDIDO DE VENDA */}
            {reportType === 'order' && selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Número do Pedido</span>
                    <span className="text-base font-black font-mono text-slate-900">{selectedOrder.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Data de Emissão</span>
                    <span className="text-sm font-semibold text-slate-800">{formatDate(selectedOrder.orderDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Prazo de Entrega</span>
                    <span className="text-sm font-bold text-amber-800">{formatDate(selectedOrder.deliveryDate)}</span>
                  </div>
                </div>

                {/* Cliente */}
                {(() => {
                  const client = database.partners.find((p) => p.id === selectedOrder.customerId);
                  return (
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dados do Cliente</span>
                      <p className="text-sm font-bold text-slate-900">{client ? client.name : 'Cliente'}</p>
                      <p className="text-slate-600 font-mono text-xs">Documento: {client ? client.document : '-'}</p>
                      <p className="text-slate-600 text-xs">
                        {client ? `${client.email} | ${client.phone} | ${client.address || ''} ${client.city || ''}` : '-'}
                      </p>
                    </div>
                  );
                })()}

                {/* Itens do Pedido */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">Produtos do Pedido</h4>
                  <table className="w-full text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-r border-slate-200">Código</th>
                        <th className="p-2 border-r border-slate-200">Descrição do Produto</th>
                        <th className="p-2 border-r border-slate-200 text-right">Qtd</th>
                        <th className="p-2 border-r border-slate-200 text-right">Preço Unit.</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {selectedOrder.items.map((item) => {
                        const prod = database.products.find((p) => p.id === item.productId);
                        return (
                          <tr key={item.id}>
                            <td className="p-2 border-r border-slate-200 text-slate-600">{prod ? prod.code : '-'}</td>
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold text-slate-900">
                              {prod ? prod.name : 'Produto'}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right font-bold text-slate-800">
                              {item.quantity} un
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right text-slate-600">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="p-2 text-right text-slate-700 font-sans">
                          Valor Total do Pedido:
                        </td>
                        <td className="p-2 text-right font-mono text-base text-slate-900">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedOrder.notes && (
                  <p className="text-slate-600 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                    <strong>Observações do Pedido:</strong> {selectedOrder.notes}
                  </p>
                )}
              </div>
            )}

            {/* 3. RELATÓRIO DA FICHA TÉCNICA (BOM) */}
            {reportType === 'product_bom' && selectedProduct && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Código</span>
                    <span className="text-base font-black font-mono text-slate-900">{selectedProduct.code}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Categoria</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedProduct.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tempo de Processo</span>
                    <span className="text-sm font-bold text-indigo-700 font-mono">
                      {formatMinutes(selectedProduct.processTimeMinutes)} / {selectedProduct.processTimeUnit}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedProduct.name}</h3>
                  {selectedProduct.notes && <p className="text-xs text-slate-500 mt-1">{selectedProduct.notes}</p>}
                </div>

                {/* Componentes */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                    Matérias-Primas Requeridas por Unidade Fabricada (BOM)
                  </h4>
                  <table className="w-full text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-r border-slate-200">Código Insumo</th>
                        <th className="p-2 border-r border-slate-200">Matéria-Prima</th>
                        <th className="p-2 border-r border-slate-200 text-right">Qtd Necessária</th>
                        <th className="p-2 border-r border-slate-200 text-right">Custo Unit. Insumo</th>
                        <th className="p-2 text-right">Custo na Peça</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {selectedProduct.components.map((c, i) => {
                        const mat = database.materials.find((m) => m.id === c.materialId);
                        const cost = mat ? c.quantityNeeded * mat.unitCost : 0;
                        return (
                          <tr key={i}>
                            <td className="p-2 border-r border-slate-200 text-slate-600">{mat ? mat.code : '-'}</td>
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold text-slate-900">
                              {mat ? mat.name : 'Insumo'}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right font-bold text-slate-800">
                              {c.quantityNeeded} {mat ? mat.unit : ''}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right text-slate-600">
                              {mat ? formatCurrency(mat.unitCost) : '-'}
                            </td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              {formatCurrency(cost)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="p-2 text-right text-slate-700 font-sans">
                          Custo Total de Matérias-Primas por Peça:
                        </td>
                        <td className="p-2 text-right font-mono text-emerald-800">
                          {formatCurrency(
                            selectedProduct.components.reduce((acc, c) => {
                              const mat = database.materials.find((m) => m.id === c.materialId);
                              return acc + (mat ? c.quantityNeeded * mat.unitCost : 0);
                            }, 0)
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* 4. RELATÓRIO DE REPOSIÇÃO DE ESTOQUE */}
            {reportType === 'stock' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <strong>Relatório de Compras Urgentes:</strong> Listagem de matérias-primas cujo estoque físico está igual ou abaixo do estoque mínimo de segurança.
                </div>

                <table className="w-full text-left border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 border-r border-slate-200">Código</th>
                      <th className="p-2 border-r border-slate-200">Matéria-Prima</th>
                      <th className="p-2 border-r border-slate-200 text-right">Estoque Atual</th>
                      <th className="p-2 border-r border-slate-200 text-right">Estoque Mínimo</th>
                      <th className="p-2 border-r border-slate-200 text-right">Sugestão Compra</th>
                      <th className="p-2">Fornecedor de Referência</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {lowStockItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400 font-sans">
                          Nenhum insumo abaixo do estoque mínimo.
                        </td>
                      </tr>
                    ) : (
                      lowStockItems.map((m) => {
                        const supplier = database.partners.find((p) => p.id === m.supplierId);
                        const buySuggestion = Math.max(0, m.minStock * 2 - m.currentStock);

                        return (
                          <tr key={m.id}>
                            <td className="p-2 border-r border-slate-200 text-slate-600">{m.code}</td>
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold text-slate-900">{m.name}</td>
                            <td className="p-2 border-r border-slate-200 text-right font-bold text-rose-700">
                              {m.currentStock} {m.unit}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right text-slate-600">
                              {m.minStock} {m.unit}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right font-bold text-emerald-800">
                              +{buySuggestion} {m.unit}
                            </td>
                            <td className="p-2 font-sans text-slate-700">
                              {supplier ? `${supplier.name} (${supplier.phone})` : '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. RELATÓRIO EXECUTIVO DE PCP */}
            {reportType === 'pcp_summary' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                    1. Ordens de Produção Programadas e em Andamento
                  </h4>
                  <table className="w-full text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-r border-slate-200">OP</th>
                        <th className="p-2 border-r border-slate-200">Produto</th>
                        <th className="p-2 border-r border-slate-200 text-right">Lote</th>
                        <th className="p-2 border-r border-slate-200">Posto</th>
                        <th className="p-2 border-r border-slate-200">Prazo</th>
                        <th className="p-2 border-r border-slate-200">Status</th>
                        <th className="p-2 text-right">Tempo Previsto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {database.productionOrders.map((op) => {
                        const prod = database.products.find((p) => p.id === op.productId);
                        const wc = database.workCenters.find((w) => w.id === op.workCenterId);
                        return (
                          <tr key={op.id}>
                            <td className="p-2 font-mono font-bold border-r border-slate-200">{op.opNumber}</td>
                            <td className="p-2 font-semibold border-r border-slate-200">{prod ? prod.name : '-'}</td>
                            <td className="p-2 font-mono text-right font-bold border-r border-slate-200">{op.quantity} un</td>
                            <td className="p-2 border-r border-slate-200 text-slate-600">{wc ? wc.name : '-'}</td>
                            <td className="p-2 border-r border-slate-200">{formatDate(op.scheduledEndDate)}</td>
                            <td className="p-2 uppercase font-semibold border-r border-slate-200 text-[10px]">{op.status}</td>
                            <td className="p-2 font-mono text-right">{formatMinutes(op.estimatedTimeMinutes)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                    2. Capacidade dos Postos de Trabalho
                  </h4>
                  <table className="w-full text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-r border-slate-200">Posto</th>
                        <th className="p-2 border-r border-slate-200">Jornada</th>
                        <th className="p-2 border-r border-slate-200">Eficiência</th>
                        <th className="p-2 text-right">Capacidade Efetiva / Semana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {database.workCenters.map((wc) => {
                        const effective = wc.dailyHours * wc.daysPerWeek * wc.workersCount * (wc.efficiencyPercentage / 100);
                        return (
                          <tr key={wc.id}>
                            <td className="p-2 font-semibold border-r border-slate-200">{wc.name} ({wc.code})</td>
                            <td className="p-2 border-r border-slate-200">{wc.dailyHours}h/dia ({wc.daysPerWeek}d/sem) • {wc.workersCount} op</td>
                            <td className="p-2 border-r border-slate-200 font-mono">{wc.efficiencyPercentage}%</td>
                            <td className="p-2 font-mono font-bold text-right text-indigo-700">{Math.round(effective * 10) / 10}h</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Rodapé do Relatório */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
              <span>Mini-ERP Manufatura • Sistema de Planejamento e Controle da Produção</span>
              <span>Página 1 de 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

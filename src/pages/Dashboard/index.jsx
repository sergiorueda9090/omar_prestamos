import React, { useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MyContext } from "../../App";
import { actionGetDashboardStats } from "../../store/dashboardStore/dashboardActions";
import { BackdropComponent } from "../../components/Backdrop/Backdrop";

// Formatear moneda colombiana
const fmt = (value) => {
  const num = parseInt(value) || 0;
  return `$${num.toLocaleString('es-CO')}`;
};

// Componente Card principal (grande)
const MainCard = ({ title, value, subtitle, color, icon }) => (
  <div className="col-md-4 mb-3">
    <div
      className="card border-0 shadow-sm h-100"
      style={{ borderLeft: `4px solid ${color}`, borderLeftStyle: 'solid' }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="text-muted mb-1" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
            <h3 className="mb-0" style={{ fontWeight: 700, color }}>{value}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div
            style={{
              width: 50, height: 50, borderRadius: '12px',
              background: `${color}15`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', color,
            }}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Componente fila de la tabla de resumen por tipo
const TipoRow = ({ tipo, data, color }) => (
  <tr>
    <td>
      <span className="badge" style={{ background: color, color: '#fff', fontSize: '12px', padding: '5px 12px' }}>
        {tipo}
      </span>
    </td>
    <td style={{ fontWeight: 600 }}>{data.clientes}</td>
    <td>{fmt(data.saldo_inversion)}</td>
    <td>{fmt(data.saldo_total)}</td>
  </tr>
);

export const Dashboard = () => {
  const dispatch = useDispatch();
  const context = useContext(MyContext);
  const {
    totalInversion, totalSaldo, totalClientes,
    mensual, quincenal, semanal, diario,
    perdidos, pagados, resumenMensual, loaded,
  } = useSelector(state => state.dashboardStore);

  useEffect(() => {
    context.setIsHideSideBarAndHeader(false);
    window.scrollTo(0, 0);
    dispatch(actionGetDashboardStats());
  }, []);

  return (
    <>
      <div className="right-content w-100">

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mt-3 mb-3">
          <h3 className="hd mb-0">Dashboard</h3>
        </div>

        {/* Cards principales */}
        <div className="row">
          <MainCard
            title="Total Clientes Vigentes"
            value={totalClientes}
            subtitle="Clientes con estado vigente"
            color="#2563eb"
            icon={<span>&#128101;</span>}
          />
          <MainCard
            title="Saldo a la Inversion"
            value={fmt(totalInversion)}
            subtitle="Capital prestado vigente"
            color="#059669"
            icon={<span>&#128176;</span>}
          />
          <MainCard
            title="Saldo Total"
            value={fmt(totalSaldo)}
            subtitle="Total a recaudar vigente"
            color="#d97706"
            icon={<span>&#128200;</span>}
          />
        </div>

        {/* Tabla resumen por tipo de prestamo */}
        <div className="card shadow-sm border-0 p-3 mt-3">
          <h5 className="mb-3" style={{ fontWeight: 600 }}>Resumen por Tipo de Prestamo</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead style={{ background: '#f8f9fa' }}>
                <tr>
                  <th>Tipo</th>
                  <th>Clientes</th>
                  <th>Saldo a la Inversion</th>
                  <th>Saldo Total</th>
                </tr>
              </thead>
              <tbody>
                <TipoRow tipo="Mensual" data={mensual} color="#2563eb" />
                <TipoRow tipo="Quincenal" data={quincenal} color="#7c3aed" />
                <TipoRow tipo="Semanal" data={semanal} color="#059669" />
                <TipoRow tipo="Diario" data={diario} color="#d97706" />
              </tbody>
              <tfoot style={{ background: '#f8f9fa', fontWeight: 700 }}>
                <tr>
                  <td>Total Vigentes</td>
                  <td>{totalClientes}</td>
                  <td>{fmt(totalInversion)}</td>
                  <td>{fmt(totalSaldo)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Cards de Pagados y Perdidos */}
        <div className="row mt-3">
          <div className="col-md-6 mb-3">
            <div className="card shadow-sm border-0 h-100" style={{ borderLeft: '4px solid #16a34a' }}>
              <div className="card-body">
                <h6 className="text-muted mb-2" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>Clientes Pagados</h6>
                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <h2 className="mb-0" style={{ fontWeight: 700, color: '#16a34a' }}>{pagados.clientes}</h2>
                    <small className="text-muted">clientes</small>
                  </div>
                  <div className="text-end">
                    <p className="mb-0" style={{ fontSize: '14px' }}>
                      <strong>Inversion:</strong> {fmt(pagados.saldo_inversion)}
                    </p>
                    <p className="mb-0" style={{ fontSize: '14px' }}>
                      <strong>Saldo Total:</strong> {fmt(pagados.saldo_total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card shadow-sm border-0 h-100" style={{ borderLeft: '4px solid #dc2626' }}>
              <div className="card-body">
                <h6 className="text-muted mb-2" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>Clientes Perdidos</h6>
                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <h2 className="mb-0" style={{ fontWeight: 700, color: '#dc2626' }}>{perdidos.clientes}</h2>
                    <small className="text-muted">clientes</small>
                  </div>
                  <div className="text-end">
                    <p className="mb-0" style={{ fontSize: '14px' }}>
                      <strong>Inversion perdida:</strong> {fmt(perdidos.saldo_inversion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla resumen mensual (ultimos 6 meses) */}
        {resumenMensual && resumenMensual.length > 0 && (
          <div className="card shadow-sm border-0 p-3 mt-3 mb-4">
            <h5 className="mb-3" style={{ fontWeight: 600 }}>Prestamos por Mes (ultimos 6 meses)</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-hover mb-0">
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th>Mes</th>
                    <th>Clientes Nuevos</th>
                    <th>Saldo a la Inversion</th>
                    <th>Saldo Total</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenMensual.map((mes, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{mes.mes}</td>
                      <td>
                        <span className="badge bg-primary" style={{ fontSize: '13px', padding: '5px 10px' }}>
                          {mes.clientes}
                        </span>
                      </td>
                      <td>{fmt(mes.saldo_inversion)}</td>
                      <td>{fmt(mes.saldo_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      <BackdropComponent />
    </>
  );
}

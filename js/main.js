document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('minutos-ducha');
  const duchaVal = document.getElementById('ducha-val');
  const resultadoLitros = document.getElementById('resultado-litros');

  if (slider) {
    const LITROS_POR_MINUTO = 12;

    slider.addEventListener('input', (e) => {
      const minutos = e.target.value;
      duchaVal.textContent = minutos;
      
      const totalAnual = minutos * LITROS_POR_MINUTO * 365;
      resultadoLitros.textContent = totalAnual.toLocaleString('es-CO');
    });
  }
});
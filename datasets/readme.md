## ODS 11

[Datos abiertos del sector ambiente](https://sinia.minam.gob.pe/portal/datos-abiertos/):

| Dataset                                                                                                                                                                                                              | Descripción                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Valorización de residuos sólidos Inorgánicos a nivel distrital](https://datosabiertos.gob.pe/dataset/valorizaci%C3%B3n-de-residuos-s%C3%B3lidos-nivel-distrital-ministerio-del-ambiente-minam)                      | Información sobre el reaprovechamiento y valorización de residuos inorgánicos (plásticos, metales, vidrio, papel, etc.) gestionados por los municipios a nivel distrital. |
| [Valorización de residuos sólidos Orgánicos a nivel distrital](https://datosabiertos.gob.pe/dataset/valorizaci%C3%B3n-de-residuos-s%C3%B3lidos-nivel-distrital-ministerio-del-ambiente-minam)                        | Datos sobre el reaprovechamiento y valorización de residuos orgánicos (restos de alimentos, residuos vegetales) gestionados a nivel distrital.                            |
| [Composición de residuos sólidos domiciliarios](https://datosabiertos.gob.pe/dataset/composici%C3%B3n-de-residuos-s%C3%B3lidos-domiciliarios)                                                                        | Proporción de diferentes tipos de residuos generados en los hogares (orgánicos, plásticos, metales, vidrio, papel, entre otros).                                          |
| [Disposición final adecuada de residuos sólidos](https://datosabiertos.gob.pe/dataset/disposici%C3%B3n-final-adecuada-de-residuos-s%C3%B3lidos-ministerio-del-ambiente-minam)                                        | Registra la cantidad de residuos que son llevados a infraestructuras autorizadas (rellenos sanitarios, celdas de seguridad, entre otros).                                 |
| [Generación anual de residuos sólidos domiciliarios y municipales](https://datosabiertos.gob.pe/dataset/generaci%C3%B3n-anual-de-residuos-s%C3%B3lidos-domiciliarios-y-municipales-ministerio-del-ambiente)          | Estadísticas anuales de generación de residuos en hogares y a nivel municipal.                                                                                            |
| [Residuos municipales generados anualmente](https://datosabiertos.gob.pe/dataset/residuos-municipales-generados-anualmente)                                                                                          | Cantidad de residuos generados por los municipios del país, con variación por año.                                                                                        |
| [Implementación del Programa Municipal EDUCCA](https://www.datosabiertos.gob.pe/dataset/implementaci%C3%B3n-del-programa-municipal-de-educaci%C3%B3n-cultura-y-ciudadan%C3%ADa-ambiental-programa)                   | Información sobre la ejecución a nivel distrital del Programa EDUCCA, orientado a educación y cultura ambiental en la ciudadanía.                                         |
| [Disposición final adecuada de residuos sólidos (duplicado)](https://www.datosabiertos.gob.pe/dataset/disposici%C3%B3n-final-adecuada-de-residuos-s%C3%B3lidos-ministerio-del-ambiente-minam)                        | Mismo dataset que el anterior sobre disposición final adecuada de residuos, listado dos veces en el portal.                                                               |
| [Inventario Nacional de Áreas Degradadas por residuos sólidos municipales](https://www.datosabiertos.gob.pe/dataset/inventario-nacional-de-%C3%A1reas-degradadas-por-residuos-s%C3%B3lidos-municipales-organismo-de) | Registro de sitios degradados por acumulación o disposición inadecuada de residuos sólidos municipales en el país.                                                        |

# Roadmap de Dashboard para Gestión de Residuos Sólidos (Perú)

Este dashboard busca mostrar la historia completa de los residuos: desde la
**generación**, pasando por la **valorización**, la **disposición final**, la
**composición**, los **programas ambientales** y finalmente los **impactos**.

---

## 1. Generación de residuos

**Datasets:**

- Generación anual de residuos sólidos domiciliarios y municipales
- Residuos municipales generados anualmente

**Gráficos sugeridos:**

- Serie de tiempo (línea): evolución de toneladas de residuos generados
  (2000–2024).
- Mapa temático: intensidad de generación por distrito/provincia.
- Ranking (barras): Top 10 municipios que más generan.
- Indicador: kg de residuos per cápita por año.

---

## 2. Valorización de residuos

**Datasets:**

- Valorización de residuos sólidos Inorgánicos a nivel distrital
- Valorización de residuos sólidos Orgánicos a nivel distrital

**Gráficos sugeridos:**

- Barras agrupadas: comparación de valorización orgánica vs inorgánica por
  distrito.
- Serie temporal: evolución de valorización en toneladas por año.
- Indicador circular (%): proporción de residuos valorizados frente al total
  generado.
- Mapa: municipios con mayores tasas de valorización.

---

## 3. Disposición final de residuos

**Dataset:**

- Disposición final adecuada de residuos sólidos

**Gráficos sugeridos:**

- Serie de tiempo: % de residuos dispuestos adecuadamente vs total generado.
- Mapa: ubicación de rellenos sanitarios y distritos que atienden.
- Indicador KPI: cobertura nacional (ej. 65% residuos con disposición adecuada).
- Comparación regional: barras apiladas mostrando disposición adecuada vs
  inadecuada.

---

## 4. Caracterización de residuos

**Dataset:**

- Composición de residuos sólidos domiciliarios

**Gráficos sugeridos:**

- Gráfico circular: % de orgánicos, plásticos, vidrio, papel, metales, otros.
- Evolución temporal: cambios en la proporción de plásticos u orgánicos en 10
  años.
- Comparación entre regiones: barras horizontales por tipo de residuo.

---

## 5. Programas y gestión ambiental

**Dataset:**

- Implementación del Programa Municipal EDUCCA

**Gráficos sugeridos:**

- Mapa de cobertura: distritos con y sin EDUCCA.
- Indicador: % de municipios implementando el programa.
- Cruce de datos: comparar valorización promedio de municipios con EDUCCA vs sin
  EDUCCA.
- Línea temporal: crecimiento del programa en los últimos años.

---

## 6. Impactos ambientales

**Dataset:**

- Inventario Nacional de Áreas Degradadas por residuos sólidos municipales

**Gráficos sugeridos:**

- Mapa: localización de áreas degradadas.
- Serie temporal: evolución de áreas degradadas detectadas por año.
- Comparación con generación: scatter plot (eje X: toneladas generadas, eje Y:
  áreas degradadas).
- Indicador: número total de hectáreas degradadas registradas.

---

## Flujo narrativo del dashboard

1. **Generación** → mostrar cuánto y dónde se produce.
2. **Valorización** → mostrar cuánto se reaprovecha.
3. **Disposición** → mostrar cuánto se maneja correctamente.
4. **Composición** → mostrar de qué están hechos los residuos.
5. **Programas EDUCCA** → mostrar esfuerzos de gestión y educación ambiental.
6. **Impactos** → mostrar consecuencias de la mala gestión.

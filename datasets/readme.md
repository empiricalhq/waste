## ODS 11: Gestión de residuos sólidos en áreas urbanas (Perú)

Actualmente podemos obtener datos del
[SINIA](https://sinia.minam.gob.pe/portal/datos-abiertos/) (Sistema Nacional de
Información Ambiental):

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

El objetivo es contar la historia completa de los residuos: cómo se generan, de
qué están compuestos, cómo se valorizan, cómo se disponen, qué programas
ambientales los gestionan y cuáles son sus impactos.

1. **GENERACIÓN**

   datasets:
   - Generación anual de residuos sólidos domiciliarios y municipales
   - Residuos municipales generados anualmente
   - Generación de residuos sólidos municipales

   gráficos:
   - [ ] serie temporal: toneladas 2000-2024
   - [ ] mapa coroplético: kg per cápita por distrito/provincia
   - [ ] top 10: barras horizontales de municipios con mayor generación
   - [ ] indicador: kg de residuos per cápita por año.

2. **VALORIZACIÓN**

   datasets:
   - Valorización de residuos sólidos Inorgánicos a nivel distrital
   - Valorización de residuos sólidos Orgánicos a nivel distrital

   gráficos:
   - [ ] barras agrupadas: comparación de valorización orgánica vs inorgánica por
     distrito
   - [ ] evaluación anual: líneas de % valorizado sobre total generado
   - [ ] mapa: distritos con tasa >= 20 %

3. **DISPOSICIÓN FINAL**

   datasets:
   - Disposición final adecuada de residuos sólidos

   gráficos:
   - [ ] serie de tiempo: % de residuos dispuestos adecuadamente vs total generado.
   - [ ] mapa: rellenos sanitarios y cobertura por distrito, distritos que atienden
   - [ ] kpi: cobertura nacional último año
   - [ ] área apilada: % adecuado vs inadecuado 2010-2023

4. **COMPOSICIÓN**

   datasets:
   - Composición de residuos sólidos domiciliarios

   gráficos:
   - [ ] donut: % orgánicos, plásticos, papel, vidrio, metales, otros
   - [ ] heatmap: cambio de proporción 2014 vs 2023 por región
   - [ ] evolución temporal: cambios en la proporción de plásticos u orgánicos en 10
     años.
   - [ ] barras horizontales: comparación por tipo de residuo.

5. **PROGRAMAS DE GESTIÓN AMBIENTAL**

   datasets:
   - Implementación del Programa Municipal EDUCCA

   gráficos:
   - [ ] mapa binario: distrito con/sin educca (% de municipios)
   - [ ] boxplot: valorización per cápita – con educca vs sin educca
   - [ ] línea temporal: crecimiento del programa en los últimos años.

6. **IMPACTOS**

   datasets:
   - Inventario Nacional de Áreas Degradadas por residuos sólidos municipales

   gráficos:
   - [ ] puntos: ubicación y tamaño (ha) de áreas degradadas
   - [ ] serie temporal: evolución de áreas degradadas detectadas por año.
   - [ ] scatter: toneladas generadas vs ha degradadas por región (x: toneladas
     generadas, y: áreas degradadas).
   - [ ] indicador: total de ha registradas.

El flujo narrativo podría ser algo como:

1. Generación: mostrar cuánto y dónde se produce
2. Valorización: mostrar cuánto se reaprovecha
3. Disposición: mostrar cuánto se maneja correctamente
4. Composición: mostrar de qué están hechos los residuos
5. Programas: mostrar esfuerzos de gestión y educación ambiental
6. Impactos: mostrar consecuencias de la mala gestión

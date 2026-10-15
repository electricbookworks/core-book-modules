# Introducción a las ampliaciones matemáticas

En las secciones principales de *La economía* 2.0, explicamos relaciones económicas por medio de textos, diagramas y gráficos. En ocasiones nos servimos de expresiones algebraicas y de ecuaciones, por ejemplo, en el caso de restricciones presupuestarias o de líneas de isocoste, así como de notación de funciones, como $$Y=f(X)$$ para una función de producción. También calculamos pendientes a partir de aproximaciones lineales. Pero intentamos reducir al mínimo los conocimientos matemáticos necesarios.

Para estudiantes que tengan una base más sólida en matemáticas, hemos incluido ampliaciones en algunas secciones. En muchas de ellas se recurre a conceptos matemáticos más avanzados para desarrollar en mayor detalle los modelos utilizados en la parte principal de esa sección, si bien en algunas se profundiza en el contenido de la sección sin hacer uso de las matemáticas.

En las ampliaciones, se supone que el lector tiene conocimientos de *análisis matemático* (cálculo diferencial o infinitesimal), es decir, de los importantes métodos de cálculo desarrollados, por separado, por Isaac Newton y Gottfried Wilhelm von Leibniz en el siglo <span class='allsmallcaps'>XVII</span> (al final de esta sección, entramos en más detalles sobre la rivalidad entre estos dos científicos).

Haremos un amplio uso de uno de esos métodos, la derivación o diferenciación, que nos permite explorar la manera en que cambia una función cuando lo hacen la variable o variables que forman parte de ella. En ocasiones, también usamos la integración, que nos permite medir áreas situadas bajo los gráficos.

No es indispensable leer ninguna de las ampliaciones, ya que los modelos económicos formulados en *La economía* se entienden bien sin ellas. Pero su lectura puede ayudar a comprender mejor el funcionamiento de los modelos y la manera en que los economistas utilizan las matemáticas para que sus modelos sean claros y precisos. Al principio de cada ampliación se incluye una presentación que será de utilidad a cada estudiante para decidir si leerla o no. En ella se explica el contenido de la ampliación y se especifica si es necesario contar con algún conocimiento previo.

En la mayoría de las ampliaciones se hace más uso del álgebra y las ecuaciones que en las secciones principales. Si te sientes a gusto resolviendo ecuaciones y dibujando gráficas, su lectura te resultará más sencilla; si no, podrás practicar. Pero, cuando sea imprescindible tener conocimientos matemáticos específicos (por ejemplo, si se utiliza *análisis matemático*), se indicará en la presentación de esa ampliación.

Al final de muchas de las ampliaciones, ofrecemos recomendaciones de lecturas adicionales sobre las técnicas matemáticas utilizadas, que en muchos casos serán fragmentos escogidos de: Malcolm Pemberton y Nicholas Rau. *Mathematics for Economists: An Introductory Textbook* (4.ª ed., 2015 o 5.ª ed., 2023). Manchester: Manchester University Press.

## Notación y convenciones

### Funciones de una sola variable

{% include figure
markdown="
| $$y=f(x)$$ | Función de una variable, donde $$x$$ es la variable independiente o argumento de la función e $$y$$ es la variable dependiente
| $$\dfrac{dy}{dx}$$ | Derivada primera de $$f(x)$$
| $$f'( x)$$ | Notación alternativa para la derivada primera de $$f(x)$$
| $$\dfrac{d^2 y}{dx^2}$$ | Derivada segunda de $$f(x)$$
$$f''( x)$$ | Notación alternativa para la derivada segunda de $$f(x)$$"
class="first-column-4"
%}

### Integración

{% include figure
markdown="
| $$y=f(x)$$ | Función de una variable, donde $$x$$ es la variable independiente o argumento de la función e $$y$$ es la variable dependiente
| $$\int f(x) \, dx$$ | Integral indefinida de $$f(x)$$
| $$\int _a^b f(x) \, dx$$ | Integral definida de $$f(x)$$ entre $$a$$ y $$b$$"
class="first-column-4"
%}

### Funciones de dos variables

{% include figure
markdown="
| $$y=f (x,\ z)$$ | Función de dos variables, donde $$x$$ y $$z$$ son las variables independientes o argumentos de la función e $$y$$ es la variable dependiente
| $$\dfrac{\partial f}{\partial x} \text{ o bien }\dfrac{\partial y}{\partial x}$$ | Derivada parcial de $$f$$ con respecto a $$x$$, considerando $$z$$ constante
| $$\dfrac{\partial f}{\partial z}\text{ o bien }\dfrac{\partial y}{\partial z}$$ | Derivada parcial de $$f$$ con respecto a $$z$$, considerando $$x$$ constante
| $$\dfrac{\partial^2 f}{\partial x^2}$$ | Derivada segunda de $$f$$ con respecto a $$x$$, considerando $$z$$ constante
| $$\dfrac{\partial^2 f}{\partial z^2}$$ | Derivada segunda de $$f$$ con respecto a $$z$$, considerando $$x$$ constante
| $$\dfrac{\partial}{\partial z}\left(\dfrac{\partial f}{\partial x}\right)$$ | Derivada parcial mixta; derivada primera de $$\dfrac{\partial f}{\partial x}$$ con respecto a $$z$$
| $$\dfrac{\partial}{\partial x}\left(\dfrac{\partial f}{\partial z}\right)$$ | Derivada parcial mixta; derivada primera de $$\dfrac{\partial f}{\partial z}$$ con respecto a $$x$$
| $$\dfrac{\partial^2 f}{\partial x \, \partial z} \text{ o bien }\dfrac{\partial^2 f}{\partial z \, \partial x}$$ | Derivada parcial mixta cuando $$\dfrac{\partial}{\partial z}\left(\dfrac{\partial f}{\partial x}\right)$$ y $$\dfrac{\partial}{\partial x}\left(\dfrac{\partial f}{\partial z}\right)$$ son iguales"
class="first-column-4"
%}

## ¿Quién inventó el análisis matemático?

Posiblemente la controversia científica más famosa de todos los tiempos gira en torno a si la invención del análisis matemático se debe atribuir a Isaac Newton o a Gottfried Wilhelm von Leibniz.

{% include figure
   image="isaac-newton.jpg"
   reference=""
   caption="Isaac Newton"
   alt-text="Isaac Newton"
   source="Retrato de Godfrey Kneller, Wikipedia / Wikimedia Commons"
   class="thumbnail no-fullscreen"
%}

Isaac Newton (1642–1726) fue un matemático y físico inglés, reconocido como uno de los científicos más influyentes que jamás hayan existido. Además de inventar el análisis matemático, descubrió la ley de la gravedad, sentó las bases de la mecánica clásica, hizo importantes contribuciones a la teoría de la óptica y formuló una ley del enfriamiento. Como director de The Royal Mint (la casa de la moneda inglesa) durante el reinado de tres monarcas, Newton estableció el patrón oro, que fue el fundamento del sistema monetario internacional durante casi 200 años.

Newton utilizó métodos de cálculo infinitesimal por primera vez en un manuscrito publicado en 1666. También los empleó en su libro *Principios matemáticos de la filosofía natural*, que vio la luz en 1687. Terminó su obra dedicada al cálculo, *Método de las fluxiones y series infinitas*, en 1671, pero no se publicó hasta 1736.

{% include figure
   image="gottfried-wilhelm-von-leibniz.jpg"
   caption="Gottfried Wilhelm von Leibniz"
   alt-text="Gottfried Wilhelm von Leibniz"
   source="Retrato de Andreas Scheits, Wikipedia / Wikimedia Commons"
   class="thumbnail no-fullscreen"
%}

Gottfried Wilhelm von Leibniz (1646–1716) fue un matemático y filósofo alemán. En 1675 usó el cálculo integral para hallar el área bajo una curva e introdujo la S alargada, escrita $$\int$$, que usamos para representar las integrales y la $$d$$ para las diferenciales. Su trabajo sobre filosofía se centró en el principio del optimismo, según el cual Dios habría creado el mejor de los mundos posibles, aunque su tratado sobre el tema, *Teodicea*, lo satirizó Voltaire en la novela *Cándido*.

Los partidarios de Newton acusaron a Leibniz de plagio en su obra sobre el cálculo. Leibniz murió en la pobreza y con la reputación en declive. Posteriormente, tanto matemáticos como filósofos han restaurado su prestigio.

Los historiadores modernos convienen ahora en que, de forma independiente y casi al mismo tiempo, Newton y Leibniz inventaron lo que se conoce como análisis matemático, cálculo infinitesimal o cálculo diferencial.
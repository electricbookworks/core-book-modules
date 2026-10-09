# Introduction to mathematical extensions

In the main sections of *The Economy* 2.0 we explain economic relationships using words, diagrams, and graphs. We sometimes use simple algebraic expressions and equations—for example, for budget constraints and isocost lines—and functional notation, such as $$Y=f(X)$$ for a production function. We also calculate slopes using linear approximations. But we aim to keep the required mathematical knowledge to a minimum.

For students with a stronger mathematical background, there are *mathematical extensions* to some sections. These use more sophisticated mathematics to develop the models in the main part of the section in more depth. (There are also a few extensions that discuss the topic in the main part in greater depth without using mathematics.)

In particular, extensions often assume some knowledge of calculus. The word *calculus* refers to some important methods for mathematical analysis developed—separately—by Isaac Newton and Gottfried Wilhelm von Leibniz in the seventeenth century. (See the final section below for more about the rivalry between them.)

We will make extensive use of one of these methods, *differentiation*, which allows us to explore how a function of one or more variables changes when the variables change. Occasionally we also use *integration*, which enables us to measure areas below graphs.

It is not essential to read any of the extensions; you can understand the economic models in *The Economy* without them. But if you are able to read them, you will gain additional insights into how the models work, and the mathematical extensions will show you how economists use mathematics to make their models precise and clear. At the start of each extension there is a *preview* that will help you decide whether you should read it. The preview explains what the extension covers, and specifies any prerequisites.

Most extensions make greater use of algebra and equations than the main sections. It will be easier to read them if you are comfortable manipulating and solving equations, and drawing graphs (and useful practice if not). But if any particular mathematical knowledge is required—for example, if calculus is used—the preview will say so.

At the end of many of the extensions, we provide recommendations for further reading on relevant mathematical techniques, in most cases selected passages of: Malcolm Pemberton and Nicholas Rau. *Mathematics for Economists: An Introductory Textbook* (4th ed., 2015 or 5th ed., 2023). Manchester: Manchester University Press.

## Notation and conventions

### Functions of one variable

{% include figure
markdown="
| $$y=f(x)$$ | function of one variable, where $$x$$ is the argument and $$y$$ is the output
| $$\dfrac{dy}{dx}$$ | first derivative of $$f(x)$$
| $$f'( x)$$ | alternative notation for the first derivative of $$f(x)$$
| $$\dfrac{d^2 y}{dx^2}$$ | second derivative of $$f(x)$$
$$f''( x)$$ | alternative notation for the second derivative of $$f(x)$$"
class="first-column-4"
%}

### Integration

{% include figure
markdown="
| $$y=f(x)$$ | function of one variable, where $$x$$ is the argument and $$y$$ is the output
| $$\int f(x) \, dx$$ | indefinite integral of $$f(x)$$
| $$\int _a^b f(x) \, dx$$ | definite integral of $$f(x)$$ from $$a$$ to $$b$$"
class="first-column-4"
%}

### Functions of two variables

{% include figure
markdown="
| $$y=f (x,\ z)$$ | function of two variables, where $$x$$ and $$z$$ are the arguments and $$y$$ is the output
| $$\dfrac{\partial f}{\partial x} \text{ or }\dfrac{\partial y}{\partial x}$$ | partial derivative of $$f$$ with respect to $$x$$, treating $$z$$ as a constant 
| $$\dfrac{\partial f}{\partial z}\text{ or }\dfrac{\partial y}{\partial z}$$ | partial derivative of $$f$$ with respect to $$z$$, treating $$x$$ as a constant 
| $$\dfrac{\partial^2 f}{\partial x^2}$$ | second derivative of $$f$$ with respect to $$x$$, treating $$z$$ as constant
| $$\dfrac{\partial^2 f}{\partial z^2}$$ | second derivative of $$f$$ with respect to $$z$$, treating $$x$$ as constant
| $$\dfrac{\partial}{\partial z}\left(\dfrac{\partial f}{\partial x}\right)$$ | mixed partial derivative; first derivative of $$\dfrac{\partial f}{\partial x}$$ with respect to $$z$$ 
| $$\dfrac{\partial}{\partial x}\left(\dfrac{\partial f}{\partial z}\right)$$ | mixed partial derivative; first derivative of $$\dfrac{\partial f}{\partial z}$$ with respect to $$x$$
| $$\dfrac{\partial^2 f}{\partial x \, \partial z} \text{ or }\dfrac{\partial^2 f}{\partial z \, \partial x}$$ | mixed partial derivative when $$\dfrac{\partial}{\partial z}\left(\dfrac{\partial f}{\partial x}\right)$$ and $$\dfrac{\partial}{\partial x}\left(\dfrac{\partial f}{\partial z}\right)$$ are equal"
class="first-column-4"
%}

## Who invented calculus?

Arguably the most famous scientific controversy of all time was between Sir Isaac Newton and Gottfried Wilhelm von Leibniz over who invented calculus.

{% include figure
   image="isaac-newton.jpg"
   reference=""
   caption="Isaac Newton"
   alt-text="Portrait of Isaac Newton"
   source="Portrait by Sir Godfrey Kneller, Wikipedia/Wikimedia Commons."
   class="thumbnail no-fullscreen"
%}

Sir Isaac Newton (1642–1726) was an English mathematician and physicist who is recognized as one of the most influential scientists who ever lived. As well as inventing calculus, he discovered the law of gravity, laid the foundations of classical mechanics, made major contributions to the theory of optics, and formulated a law of cooling. As Master of the Mint under three monarchs, Newton founded the gold standard, which was the core of the international monetary system for almost 200 years.

Newton first used calculus methods in a manuscript published in 1666. The methods were used in his book *Mathematical Principles of Natural Philosophy*, which was published in 1687. He completed his book on calculus, *Method of Fluxions*, in 1671, but it was not published until 1736.

{% include figure
   image="gottfried-wilhelm-von-leibniz.jpg"
   caption="Gottfried Wilhelm von Leibniz"
   alt-text="Portrait of Gottfried Wilhelm von Leibniz."
   source="Portrait by Andreas Scheits, Wikipedia/Wikimedia Commons."
   class="thumbnail no-fullscreen"
%}

Gottfried Wilhelm von Leibniz (1646–1716) was a German mathematician and philosopher. In 1675 he used integral calculus to find the area under a curve and introduced the elongated S, written $$\int$$, that we use to represent an integral, and $$d$$ for differential. His work on philosophy focused on the principle of optimism, according to which God had created the best of all possible worlds, although his treatise on the topic, *Theodicy*, was lampooned by Voltaire in his novel *Candide.*

Newton’s supporters accused Leibniz of plagiarism in his work on calculus. By the time of Leibniz’s death, his reputation was in decline and he died in poverty. His reputation has subsequently been rebuilt by both mathematicians and philosophers.

Modern historians now accept that Newton and Leibniz invented calculus independently, at about the same time.
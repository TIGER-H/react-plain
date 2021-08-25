let React = {
  createElement: (type, props, ...children) => {
    if (typeof type === "function") {
      try {
        return type(props);
      } catch ({ promise, key }) {
        promise.then((data) => {
          promiseCache.set(key, data);
          rerender();
        });
        return {
          type: "h1",
          props: { children: ["loading"] },
        };
      }
    }
    const element = { type, props: { ...props, children } };
    console.log(element);
    return element;
  },
};

const states = [];
let stateCursor = 0;
const useState = (initialState) => {
  const FROZENCURSOR = stateCursor;
  states[FROZENCURSOR] = states[stateCursor] || initialState;
  let setState = (newState) => {
    states[FROZENCURSOR] = newState;
    rerender();
  };
  stateCursor++;

  return [states[FROZENCURSOR], setState];
};

const promiseCache = new Map();
const createResource = (cb, key) => {
  if (promiseCache.has(key)) {
    return promiseCache.get(key);
  }

  throw { promise: cb(), key };
};

const App = () => {
  const [name, setName] = useState("htg");
  const [count, setCount] = useState(0);
  const randomImage = createResource(
    () =>
      fetch("https://source.unsplash.com/random/300x200").then(
        (res) => res.url
      ),
    "image"
  );
  return (
    <div className="hello-world">
      <h1>hello {name}!</h1>
      <input
        type="text"
        placeholder="name"
        value={name}
        onchange={(e) => setName(e.target.value)}
      />
      <h2>counter : {count}</h2>
      <img src={randomImage} alt="randomimage" />
      <button onclick={() => setCount(count + 1)}>+</button>
      <button onclick={() => setCount(count - 1)}>-</button>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laboriosam
        obcaecati provident tempore, dignissimos cupiditate, autem dolores,
        perspiciatis dicta ducimus odit sit? Qui voluptatem vel nostrum
        accusamus cum, ipsum amet vitae.
      </p>
    </div>
  );
};

const render = (reactElement, container) => {
  if (["string", "number"].includes(typeof reactElement)) {
    container.appendChild(document.createTextNode(String(reactElement)));
    return;
  }
  const actualDomElement = document.createElement(reactElement.type);
  if (reactElement.props) {
    Object.keys(reactElement.props)
      .filter((p) => p !== "children")
      .forEach((p) => (actualDomElement[p] = reactElement.props[p]));
  }

  if (reactElement.props.children) {
    // render recursively
    reactElement.props.children.forEach((child) =>
      render(child, actualDomElement)
    );
  }

  container.appendChild(actualDomElement);
};

const rerender = () => {
  stateCursor = 0;
  document.getElementById("app").firstChild.remove();
  render(<App />, document.getElementById("app"));
};

render(<App />, document.getElementById("app"));

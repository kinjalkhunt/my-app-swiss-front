import { BrowserRouter } from "react-router-dom";
import DefaultLayout from "./Components/Layout/DefaultLayout";

function App() {
  return (
    <div>
      <BrowserRouter>
        <DefaultLayout />
      </BrowserRouter>
    </div>
  );
}

export default App;
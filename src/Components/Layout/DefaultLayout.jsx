import Content from "./Content";


const DefaultLayout = () => {

    return (
        <div className="flex h-screen relative">

            <div className="flex-1 overflow-auto">
                <Content />
            </div>

        </div>
    );
};

export default DefaultLayout;
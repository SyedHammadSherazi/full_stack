function Parentsprops(){
    return (

        <div>

            <Myprops name="Ali" />
            </div>
    );
}


function Myprops(props) {
    return (
        <div>
            <h1>Hello, My name is {props.name}</h1>
        </div>
    );
}



export default Parentsprops;
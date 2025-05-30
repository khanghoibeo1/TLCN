import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import Button from '@mui/material/Button';
import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";

const QuantityBox = (props) => {

    const [inputVal, setInputVal] = useState(1);

    const context = useContext(MyContext);
    const selectedCountry = context.selectedCountry.iso2;

    useEffect(() => {
        if (props?.value !== undefined && props?.value !== null && props?.value !== "") {
            setInputVal(parseInt(props?.value))
        }
    }, [props.value])

    const minus = () => {
        if (inputVal !== 1 && inputVal > 0) {
            setInputVal(inputVal - 1);
        }
        context.setAlertBox({
            open:false,
        })

    }

    const handleChange = (e) => {
        let stock = parseInt(props.item.amountAvailable.find(amount => amount.iso2 === selectedCountry)?.quantity);
        const value = e.target.value;
        if (/^\d*$/.test(value) && parseInt(value) <= stock) {
            setInputVal(value);
        }
      };

    const plus = () => {
        let stock = parseInt(props.item.amountAvailable.find(amount => amount.iso2 === selectedCountry)?.quantity);
        if(inputVal<stock){
            setInputVal(inputVal + 1);
        }else{
            context.setAlertBox({
                open:true,
                error:true,
                msg:"The quantity is greater than product count in stock"
            })
        }
    }

    useEffect(() => {
        if (props.quantity) {
            props.quantity(inputVal)
        }

        if (props.selectedItem) {
            props.selectedItem(props.item, inputVal);
        }

    }, [inputVal]);

    return (
        <div className='quantityDrop d-flex align-items-center'>
            <Button onClick={minus}><FaMinus /></Button>
            <input type="text" value={inputVal} onChange={handleChange}/>
            <Button onClick={plus}><FaPlus /></Button>
        </div>
    )
}

export default QuantityBox;
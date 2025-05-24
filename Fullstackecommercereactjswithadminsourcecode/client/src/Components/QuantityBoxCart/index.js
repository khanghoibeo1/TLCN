import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import Button from '@mui/material/Button';
import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData } from '../../utils/api';

const QuantityBox = (props) => {

    const [inputVal, setInputVal] = useState(1);
    const [batchData, setBatchData] = useState(null);

    const context = useContext(MyContext);
    const selectedCountry = context.selectedCountry;

    useEffect(() => {
        fetchDataFromApi(`/api/batchCodes/${props.item.batchId}`).then((res) => {
            setBatchData(res)
            console.log(res)
        })
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
        let stock = parseInt(batchData.amountRemain);
        const value = e.target.value;
        if (/^\d*$/.test(value) && parseInt(value) <= stock) {
            setInputVal(value);
        }
      };

    const plus = () => {
        let stock = parseInt(batchData.amountRemain);
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
import { useRef } from "react";
import { IoSearch } from "react-icons/io5";


const SearchBox = (props)=>{

    const searchInput = useRef();

    const onSearch=()=>{
        props.onSearch(searchInput.current.value);
    }

    return(
        <div className="searchBox posotion-relative d-flex align-items-center">
            <IoSearch className="mr-2"/>
            <input type="text" placeholder="Search here (name, etc.)" ref={searchInput} onChange={onSearch}/>
        </div>
    )
}

export default SearchBox;
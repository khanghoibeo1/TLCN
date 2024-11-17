import { useRef } from "react";
import { IoSearch } from "react-icons/io5";

const SearchPostBox = (props) => {
    const searchInput = useRef();

    const searchPosts = () => {
        props.searchPosts(searchInput.current.value);
    }

    return (
        <div className="searchBox position-relative d-flex align-items-center">
            <IoSearch className="mr-2" />
            <input 
                type="text" 
                placeholder="Search posts..." 
                ref={searchInput} 
                onChange={searchPosts} 
            />
        </div>
    );
}

export default SearchPostBox;

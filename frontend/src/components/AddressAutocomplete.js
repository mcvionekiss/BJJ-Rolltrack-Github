import React, { useState, useEffect, useRef } from "react";
import { TextField, List, ListItem, Paper } from "@mui/material";
import axios from "axios";


export default function AddressAutocomplete({ onAddressSelect, addressValue, cityValue, stateValue }) {
    const [addressQuery, setAddressQuery] = useState(addressValue || ""); // Address field state
    const [cityQuery, setCityQuery] = useState(cityValue || ""); // City field state
    const [stateQuery, setStateQuery] = useState(stateValue || ""); // State field state
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionBoxRef = useRef(null);

    useEffect(() => {
        setAddressQuery(addressValue || ""); // Update when parent prop changes
    }, [addressValue]);

    useEffect(() => {
        setCityQuery(cityValue || ""); // Update when parent prop changes
    }, [cityValue]);

    useEffect(() => {
        setStateQuery(stateValue || ""); // Update when parent prop changes
    }, [stateValue]);

    useEffect(() => {
        if (addressQuery.length > 2 && showSuggestions) { // <- Only trigger if user already opened suggestions
            fetchSuggestions(addressQuery);
        }
    }, [addressQuery, showSuggestions]);

    const fetchSuggestions = async (input) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${input}&addressdetails=1&countrycodes=us`
            );
            setSuggestions(response.data);
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
        }
    };

    const handleSelectAddress = (suggestion) => {
        const { address } = suggestion;
        console.log(address);
        
        const state = address.state || "";
        const postcode = address.postcode || "";
        const formattedState = `${state} ${postcode}`.trim();

        // Extract values based on index
        const addressArray = Object.values(suggestion.address);
        console.log("Address Array:", addressArray);
        const numberAddress = addressArray[0] || ""; // House number
        const streetName = addressArray[1] || ""; // Street/Road name
        const formattedAddress = `${numberAddress} ${streetName}`.trim();
        const city = addressArray[2] || ""; // City/Village/Suburb

        // Update states to display selected values in respective input fields
        setAddressQuery(formattedAddress);
        setCityQuery(city);
        setStateQuery(formattedState);

        // Send data to parent component
        onAddressSelect(formattedAddress, city, formattedState);

        // Hide suggestion list
        setShowSuggestions(false); 
    };

    const handleManualInput = () => {
        // Call onAddressSelect when user manually enters an address
        setAddressQuery(addressQuery);
        onAddressSelect(addressQuery, cityQuery, stateQuery);

        setShowSuggestions(false); // Hide suggestions when user moves to another field
    };

    return (
        <div style={{ position: "relative" }}>
            <TextField
                label="Gym Address"
                placeholder="Start typing your address..."
                name = "address"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={handleManualInput} // Save manually entered address when leaving the field
                fullWidth
                margin="normal"
                required
            />
            
            {showSuggestions && suggestions.length > 0 && (
                <Paper
                    ref={suggestionBoxRef}
                    elevation={3}
                    style={{
                        position: "absolute",
                        zIndex: 2,
                        width: "100%",
                        maxHeight: "200px",
                        overflowY: "auto",
                    }}
                >
                    <List>
                        {suggestions.map((suggestion, index) => (
                            <ListItem
                                key={index}
                                button={true}
                                onMouseDown={(event) => {
                                    handleSelectAddress(suggestion);
                                }}
                            >
                                {suggestion.display_name}
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </div>
    );
}
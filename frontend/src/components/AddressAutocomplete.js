import React, { useState, useEffect, useRef } from "react";
import { TextField, List, ListItem, Paper } from "@mui/material";
import axios from "axios";

export default function AddressAutocomplete({ onAddressSelect }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionBoxRef = useRef(null);

    // Fetch address suggestions when the user types
    useEffect(() => {
        if (query.length > 2) {
            fetchSuggestions(query);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [query]);

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

        const streetNumber = address.house_number || "";
        const streetName = address.road || "";
        const formattedAddress = `${streetNumber} ${streetName}`.trim();

        const city =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            address.hamlet ||
            address.municipality ||
            address.state_district ||
            address.locality ||
            "City not found, enter manually.";
        const state = address.state || "";
        const postcode = address.postcode || "";
        const formattedState = `${state} ${postcode}`.trim();

        // Update parent component with the selected address
        onAddressSelect(formattedAddress, city, formattedState);
        setQuery(formattedAddress); // Show selected address
        setShowSuggestions(false); // Hide suggestion list
    };

    const handleManualInput = () => {
        // Call onAddressSelect when user manually enters an address
        if (query.length > 2) {
            onAddressSelect(query, "", ""); // Pass city & state as empty (manual entry)
        }
        setShowSuggestions(false); // Hide suggestions when user moves to another field
    };

    const handleClickOutside = (event) => {
        if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <div style={{ position: "relative" }}>
            <TextField
                label="Gym Address"
                placeholder="Start typing your address..."
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={handleManualInput} // Save manually entered address when leaving the field
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
                ><List>
                        {suggestions.map((suggestion, index) => (
                            <ListItem
                                key={index}
                                button
                                onClick={() => handleSelectAddress(suggestion)}
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
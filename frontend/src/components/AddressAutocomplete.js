import React, { useState, useEffect } from "react";
import { TextField, List, ListItem, Paper } from "@mui/material";
import axios from "axios";

export default function AddressAutocomplete({ onAddressSelect }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    // Fetch address suggestions when the user types
    useEffect(() => {
        if (query.length > 2) {
            fetchSuggestions(query);
        } else {
            setSuggestions([]);
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

    return (
        <div style={{ position: "relative" }}>
            <TextField
                label="Gym Address"
                placeholder="Start typing your address..."
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                margin="normal"
                required
            />
            {suggestions.length > 0 && (
                <Paper elevation={3} style={{ position: "absolute", zIndex: 2, width: "100%" }}>
                    <List>
                        {suggestions.map((suggestion, index) => (
                            <ListItem
                                key={index}
                                button
                                onClick={() => {
                                    const { address } = suggestion;

                                    // Extract Street Number & Street Name
                                    const streetNumber = address.house_number || "";
                                    const streetName = address.road || "";
                                    const formattedAddress = `${streetNumber} ${streetName}`.trim();

                                    // Extract City & State
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

                                    // Update form fields
                                    onAddressSelect(formattedAddress, city, formattedState);
                                    setQuery(formattedAddress);  // Display only street in input
                                    setSuggestions([]);
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
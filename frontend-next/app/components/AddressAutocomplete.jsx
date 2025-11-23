import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextField, List, ListItem, Paper } from "@mui/material";
import axios from "axios";

export default function AddressAutocomplete({
  onAddressSelect,
  addressValue = "",
  cityValue = "",
  stateValue = "",
}) {
  const [addressQuery, setAddressQuery] = useState(addressValue);
  const [cityQuery, setCityQuery] = useState(cityValue);
  const [stateQuery, setStateQuery] = useState(stateValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const containerRef = useRef(null);

  //
  // Fetch suggestions (debounced)
  //
  const fetchSuggestions = useCallback(async (input) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${input}&addressdetails=1&countrycodes=us`
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, []);

  useEffect(() => {
    if (!showSuggestions || addressQuery.length < 3) return;

    const timeout = setTimeout(() => {
      fetchSuggestions(addressQuery);
    }, 350);

    return () => clearTimeout(timeout);
  }, [addressQuery, showSuggestions, fetchSuggestions]);

  //
  // Handle suggestion selection
  //
  const handleSelect = (suggestion) => {
    const address = suggestion.address;

    const streetNumber = address.house_number || "";
    const street = address.road || address.street || "";
    const formattedAddress = `${streetNumber} ${street}`.trim();

    const city =
      address.city || address.town || address.village || address.suburb || "";

    const formattedState = [address.state, address.postcode]
      .filter(Boolean)
      .join(" ");

    setAddressQuery(formattedAddress);
    setCityQuery(city);
    setStateQuery(formattedState);

    onAddressSelect(formattedAddress, city, formattedState);
    setShowSuggestions(false);
  };

  //
  // Handle manual input when user leaves the field
  //
  const handleManualCommit = () => {
    onAddressSelect(addressQuery, cityQuery, stateQuery);
    setShowSuggestions(false);
  };

  //
  // Close suggestions dropdown when clicking outside
  //
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <TextField
        label="Gym Address"
        placeholder="Start typing your address..."
        value={addressQuery}
        onChange={(e) => setAddressQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(handleManualCommit, 150)} // delay avoids blur conflict
        fullWidth
        margin="normal"
        required
      />

      {showSuggestions && suggestions.length > 0 && (
        <Paper
          elevation={3}
          style={{
            position: "absolute",
            zIndex: 10,
            width: "100%",
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          <List>
            {suggestions.map((s, index) => (
              <ListItem
                key={index}
                button
                onMouseDown={() => handleSelect(s)} // mousedown avoids blur issues
              >
                {s.display_name}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}

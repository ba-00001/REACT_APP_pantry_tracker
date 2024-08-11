'use client' // Ensures the component is treated as a client-side component

import Image from "next/image"; // Import Next.js Image component for optimized images
import { useState, useEffect } from 'react'; // Import React hooks for state management and side effects
import { firestore } from "@/firebase"; // Import initialized Firestore instance from Firebase configuration
import { 
  Box, Button, Modal, Stack, TextField, Typography, Card, 
  CardContent, IconButton, Tooltip 
} from "@mui/material"; // Import Material UI components for UI elements
import { 
  collection, deleteDoc, doc, getDocs, query, setDoc, getDoc 
} from "firebase/firestore"; // Import Firestore methods for database operations
import SearchIcon from '@mui/icons-material/Search'; // Import Material UI search icon
import EditIcon from '@mui/icons-material/Edit'; // Import Material UI edit icon

export default function Home() {
  // State variables for managing inventory, modal visibility, item name input, search term, and loading state
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Function to fetch and update the inventory from Firestore
  const updateInventory = async () => {
    try {
      setLoading(true); // Set loading to true before fetching data
      const snapshot = query(collection(firestore, 'inventory')); // Create a query for the 'inventory' collection
      const docs = await getDocs(snapshot); // Fetch all documents in the 'inventory' collection
      const inventoryList = []; // Temporary array to hold the inventory data

      // Iterate over each document and push it to the inventory list
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });

      setInventory(inventoryList); // Update the inventory state with the fetched data
      console.log(inventoryList); // Log the inventory data for debugging
    } catch (error) {
      console.error("Error fetching inventory: ", error); // Log any errors that occur during fetching
    } finally {
      setLoading(false); // Set loading to false after the operation is complete
    }
  };

  // Function to add an item to the inventory or increment its quantity if it already exists
  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item); // Reference to the document for the item in Firestore
      const docSnap = await getDoc(docRef); // Fetch the document to check if it exists

      if (docSnap.exists()) {
        const { quantity } = docSnap.data(); // Get the current quantity from the document
        await setDoc(docRef, { quantity: quantity + 1 }); // Increment the quantity by 1
      } else {
        await setDoc(docRef, { quantity: 1 }); // If the item doesn't exist, create it with a quantity of 1
      }

      await updateInventory(); // Update the inventory after the operation
    } catch (error) {
      console.error("Error adding item: ", error); // Log any errors that occur during adding
    }
  };

  // Function to remove an item from the inventory or decrement its quantity if greater than 1
  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item); // Reference to the document for the item in Firestore
      const docSnap = await getDoc(docRef); // Fetch the document to check if it exists

      if (docSnap.exists()) {
        const { quantity } = docSnap.data(); // Get the current quantity from the document
        if (quantity === 1) {
          await deleteDoc(docRef); // If the quantity is 1, delete the document
        } else {
          await setDoc(docRef, { quantity: quantity - 1 }); // Otherwise, decrement the quantity by 1
        }
      }

      await updateInventory(); // Update the inventory after the operation
    } catch (error) {
      console.error("Error removing item: ", error); // Log any errors that occur during removal
    }
  };

  // Function to handle the search input and update the search term
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Fetch the inventory when the component first mounts
  useEffect(() => {
    updateInventory();
  }, []);

  // Handlers to open and close the modal for adding a new item
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Placeholder function for handling item editing (implementation needed)
  const handleEditItem = (name) => {
    console.log("Editing item:", name);
    // Implement your edit functionality here
  };

  // Filter the inventory based on the search term
  const filteredInventory = inventory.filter(({ name }) => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render the component UI
  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      gap={2}
      padding={4}
    >
      {/* Modal for adding a new item */}
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          borderRadius={2}
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)"
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
              placeholder="Enter item name"
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName(''); // Clear the input after adding the item
                handleClose(); // Close the modal
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Search bar and button to open the add item modal */}
      <Box width="800px" display="flex" justifyContent="space-between" mb={2}>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search items"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            endAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
      </Box>

      {/* Heading for the inventory list */}
      <Typography variant="h4" mb={2}>Inventory Items</Typography>

      {/* Display the inventory list */}
      <Box border="1px solid #333" borderRadius={2} width="800px" p={2} bgcolor="#ffffff">
        {loading ? (
          <Typography>Loading inventory...</Typography> // Show a loading message while data is being fetched
        ) : (
          <Stack spacing={2} overflow="auto">
            {filteredInventory.map(({ name, quantity }) => (
              <Card key={name} variant="outlined">
                <CardContent 
                  display="flex" 
                  flexDirection="row" 
                  alignItems="center" 
                  justifyContent="space-between"
                >
                  <Box display="flex" flexDirection="column">
                    <Typography variant="h5" color="#333">
                      {name.charAt(0).toUpperCase() + name.slice(1)} {/* Capitalize the first letter of the item name */}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Quantity: {quantity} {/* Display the item quantity */}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Tooltip title="Add">
                      <Button variant="contained" onClick={() => addItem(name)}>Add</Button>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditItem(name)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

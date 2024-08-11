'use client'
import Image from "next/image";
import {useState, useEffect} from 'react'
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography, Card, CardContent, IconButton, Tooltip } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from "firebase/firestore";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';


export default function Home() {
  const[inventory, setInventory] = useState([])
  const[open, setOpen] = useState(false)
  const[itemName, setItemName] = useState('')
  const[searchTerm, setSearchTerm] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
    console.log(inventoryList)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    }
    else{
      await setDoc(docRef, {quantity: 1})
    }

    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity === 1){
        await deleteDoc(docRef)
      }
      else{
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  useEffect(()=>{
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

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
                setItemName(e.target.value)
              }}
              placeholder="Enter item name"
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

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

      <Typography variant="h4" mb={2}>Inventory Items</Typography>

      <Box border="1px solid #333" borderRadius={2} width="800px" p={2} bgcolor="#ffffff">
        <Stack spacing={2} overflow="auto">
          {
            inventory
              .filter(({name}) => name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(({name, quantity}) => (
                <Card key={name} variant="outlined">
                  <CardContent display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Box display="flex" flexDirection="column">
                      <Typography variant="h5" color="#333">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Quantity: {quantity}
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
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              ))
          }
        </Stack>
      </Box>
    </Box>
  )
}

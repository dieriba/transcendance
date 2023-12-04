import { Button } from "@mui/material"
import { Plus } from "phosphor-react"
import { useState } from "react"

const NewChat = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
    <Button onClick={() => setOpen(true)} startIcon={<Plus />} fullWidth color="inherit" variant="contained" >
        conversation
    </Button>
    {open && <></>}
    </>
  )
}

export default NewChat
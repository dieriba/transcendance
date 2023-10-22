import { faker } from "@faker-js/faker";
import { Grid } from "@mui/material";

const Media = () => {
  return (
    <Grid container spacing={2}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((media) => {
        return (
          <Grid item xs={4}>
            <img height='55px' width='55px' src={faker.image.avatar()} alt={faker.person.fullName()} />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Media;

import { Box, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import { FlexBox } from "../../components/FlexBox";
import { shades } from "../../theme";
import Input from "../../components/Input";
import Posts from "../../components/Posts";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getRandomPrompt } from "../../utils/getRandomPrompt";
import { updateForm } from "../../state/formSlice";
import PaginationBtns from "./PaginationBtns";

const Home = () => {
  const isMobile = useMediaQuery("(max-width:767px)");
  const dispatch = useDispatch();

  const { posts, status } = useSelector(
    (state) => state.postsReducer,
    shallowEqual
  );

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt();
    dispatch(updateForm({ prompt: randomPrompt }));
  };

  return (
    <Box padding={{ xs: "20px 5%", md: "50px 5%" }}>
      {/* Heading */}
      <Box padding={{ xs: 0, md: "0 10px" }}>
        <Typography mb="5px" variant="h3">
          Create
        </Typography>
        <Typography variant="small" color={shades.primary[300]}>
          Create imaginative and visually stunning images through DALL.E AI and
          share them with the community.
        </Typography>

        <FlexBox m="20px 0 15px" columnGap={2}>
          <Typography color={shades.primary[300]}>
            Start with a detailed description
          </Typography>
          {!isMobile && (
            <Box
              sx={{
                cursor: "pointer",
              }}
              padding="7px 10px"
              backgroundColor="secondary.main"
              fontWeight="bold"
              fontSize="12px"
              borderRadius="5px"
              onClick={handleSurpriseMe}
            >
              Surprise me
            </Box>
          )}
        </FlexBox>
      </Box>

      {/* Input field */}
      <Box
        sx={{ zIndex: 100 }}
        margin={{ xs: "0 0 70px", md: "0 10px 70px" }}
        position={`${!isMobile && "sticky"}`}
        top="70px"
      >
        <Input />
      </Box>

      {/* ---------posts---------- */}
      {/* Heading */}
      <Box>
        <Typography mb="5px" variant="h3">
          The Community Showcase
        </Typography>
        <Typography variant="small" color={shades.primary[300]}>
          Browse through a collection of imaginative and visually stunning
          images generated by DALL.E AI
        </Typography>
      </Box>

      <Posts {...{ posts, status, community: true }} />
      <PaginationBtns />
    </Box>
  );
};

export default Home;

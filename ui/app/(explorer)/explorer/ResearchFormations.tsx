"use client";
import React, { useMemo } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import { Grid, TextField } from "#/app/components/MaterialUINext";
import { ChangeEventHandler } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { REGIONS } from "#/common/regions";

export default function ResearchFormations({
  initialState,
  onChange,
  onChangeDiplome,
  onChangeFiliere,
  onChangeRegion,
}: {
  initialState: {
    formations: string;
    regions: string[];
    filieres: string[];
    diplomes: string[];
  };
  onChange: ChangeEventHandler<HTMLInputElement>;
  onChangeDiplome: (diplomes: string[]) => void;
  onChangeFiliere: (filieres: string[]) => void;
  onChangeRegion: (filieres: string[]) => void;
}) {
  const regions = useMemo(() => {
    return REGIONS.map((r) => ({
      label: r.nom,
      value: r.code,
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const diplomes = [
    {
      value: "3",
      label: "CAP/BEP",
    },
    {
      value: "4",
      label: "BAC",
    },
    {
      value: "5",
      label: "DEUG/BTS/DUT/DEUST",
    },
    {
      value: "6",
      label: "Maitrise/Licence/Licence PRO/BUT",
    },
    {
      value: "7",
      label: "Master",
    },
    {
      value: "8",
      label: "Doctorat",
    },
  ];

  const [selectedRegions, setSelectedRegions] = React.useState<string[]>(initialState.regions);
  const [regionError, setRegionError] = React.useState<string>("");
  const handleChangeRegion = (event: SelectChangeEvent<typeof selectedRegions>) => {
    const {
      target: { value },
    } = event;
    const selected = typeof value === "string" ? value.split(",") : value;
    if (selected.length > 3) {
      setRegionError("Vous ne pouvez pas sélectionner plus de 3 régions");
    } else {
      setRegionError("");
      setSelectedRegions(selected);
      onChangeRegion && onChangeRegion(typeof value === "string" ? value.split(",") : value);
    }
  };

  const [selectedDiplomes, setSelectedDiplomes] = React.useState<string[]>(initialState.diplomes);
  const handleChangeDiplome = (event: SelectChangeEvent<typeof selectedDiplomes>) => {
    const {
      target: { value },
    } = event;
    setSelectedDiplomes(typeof value === "string" ? value.split(",") : value);
    onChangeDiplome && onChangeDiplome(typeof value === "string" ? value.split(",") : value);
  };

  const filieres = [
    {
      value: "cfd",
      label: "Apprentissage",
    },
    {
      value: "mef",
      label: "Scolaire",
    },
  ];
  const [selectedFilieres, setSelectedFilieres] = React.useState<string[]>(initialState.filieres);
  const handleChangeFilieres = (event: SelectChangeEvent<typeof selectedFilieres>) => {
    const {
      target: { value },
    } = event;
    setSelectedFilieres(typeof value === "string" ? value.split(",") : value);
    onChangeFiliere && onChangeFiliere(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <form autoComplete="off" style={{ flex: "1" }}>
      <Grid container spacing={2}>
        <Grid item md={4}>
          <TextField
            fullWidth
            name="formations"
            InputLabelProps={{ shrink: true }}
            label={"Formations que vous voulez rechercher"}
            placeholder={"CFD, Mefstats, Libelle"}
            defaultValue={initialState.formations}
            onChange={onChange}
          />
        </Grid>
        <Grid item md={2}>
          <FormControl fullWidth>
            <InputLabel id="filiere-label">Filières</InputLabel>
            <Select
              fullWidth
              name="filieres"
              labelId="filiere-label"
              id="filiere"
              multiple
              value={selectedFilieres}
              onChange={handleChangeFilieres}
              input={<OutlinedInput label={"Filières"} placeholder={"Filières"} />}
              renderValue={(selected) => {
                return selected.map((s) => filieres.find((d) => d.value === s)?.label).join(", ");
              }}
            >
              {filieres.map((filiere, index) => (
                <MenuItem key={index} value={filiere.value}>
                  <Checkbox checked={!!selectedFilieres.find((d) => d === filiere.value)} />
                  <ListItemText primary={filiere.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item md={2}>
          <FormControl fullWidth>
            <InputLabel id="diplome-label">Diplômes</InputLabel>
            <Select
              fullWidth
              name="diplomes"
              labelId="diplome-label"
              id="diplome"
              multiple
              value={selectedDiplomes}
              onChange={handleChangeDiplome}
              input={<OutlinedInput label={"Diplômes"} placeholder={"Diplômes"} />}
              renderValue={(selected) => {
                return selected.map((s) => diplomes.find((d) => d.value === s)?.label).join(", ");
              }}
            >
              {diplomes.map((diplome, index) => (
                <MenuItem key={index} value={diplome.value}>
                  <Checkbox checked={!!selectedDiplomes.find((d) => d === diplome.value)} />
                  <ListItemText primary={diplome.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item md={2}>
          <FormControl error={regionError ? true : false} fullWidth>
            <InputLabel id="region-label">Régions</InputLabel>
            <Select
              fullWidth
              name="regions"
              labelId="region-label"
              aria-describedby="region-error"
              id="region"
              multiple
              value={selectedRegions}
              onChange={handleChangeRegion}
              input={<OutlinedInput label={"Régions"} placeholder={"Régions"} />}
              renderValue={(selected) => {
                return selected.map((s) => regions.find((d) => d.value === s)?.label).join(", ");
              }}
            >
              {regions.map((region, index) => (
                <MenuItem key={index} value={region.value}>
                  <Checkbox checked={!!selectedRegions.find((d) => d === region.value)} />
                  <ListItemText primary={region.label} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText id="region-error">{regionError}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item md={2} style={{ textAlign: "left" }}>
          <Button type={"submit"} style={{ height: "100%" }} className="fr-btn-fix" iconId={"fr-icon-search-line"}>
            {"Rechercher des formations"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

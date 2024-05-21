---
title: "Impact LBA - Mai 2024"
subtitle: "Document de travail"
date: "Mai 2024"
output: 
    html_document:
      keep_md: yes
      toc: true
      toc_float:
        toc_collapsed: true
---



## Les questions

   -    L'exposition des données InserJeunes et les demandes de rendez-vous sur LBA ont-elles un lien?
   -    De meilleurs/moins bons taux d’insertion / d’emploi signifient t-ils des volumes de demandes de rendez-vous différents?  

## Cadre des données analysées

Les données analysées sont issues de LBA et concernent toutes les fiches formations ayant été consultées sur LBA:  

-   Antre le 1er fevrier et le 28 avril des années 2023 et 2024  
-   Ayant un CFD et un UAI valide  
-   Présentes sur le catalogue des ministères éducatifs en 2023 et en 2024  


Les formations présentes en 2023 sont utilisées comme groupe témoin. Avant le 15 mai 2023, aucune formation ne bénéficiait de l'exposition des données InserJeunes. Nous analysons l'évolution des demandes de rendez-vous en fonction de différents facteurs:  

-   L'affichage des données InserJeunes en 2024  
-   Le niveau d'entrée: avant ou après le bac  
-   Le taux de devenir favorable  
-   Le taux en emploi à 6 mois  
-   Le taux en formation  

19873 formations sont concernées par les demandes de rendez-vous selon les critères détaillés ci-dessus.

## Quelques statistiques descriptives 

### Visites sur la période

Pour ces formations, on constate une forte hausse de 180% des visites entre 2023 et 2024 (de 32010 en 2023 à 89471 en 2024) :  




| 2023 - visiteurs| 2024 - visiteurs|Evolution_visiteurs |
|----------------:|----------------:|:-------------------|
|            32010|            89471|+180%               |

### Demandes de rendez-vous sur la période

Pour ces formations, on constate une légère hausse de 1% des demandes de rendez-vous entre 2023 et 2024 ( de 5099 en 2023 à 5126 en 2024) :  



<table class=" lightable-paper" style='font-family: "Arial Narrow", arial, helvetica, sans-serif; margin-left: auto; margin-right: auto;'>
 <thead>
  <tr>
   <th style="text-align:right;"> 2023 - RDV </th>
   <th style="text-align:right;"> 2024 - RDV </th>
   <th style="text-align:left;"> Evolution_RDV </th>
  </tr>
 </thead>
<tbody>
  <tr>
   <td style="text-align:right;"> 5099 </td>
   <td style="text-align:right;"> 5126 </td>
   <td style="text-align:left;"> +1% </td>
  </tr>
</tbody>
</table>

### Demandes de rendez-vous pour 1000 visites sur la période

Pour ces formations, on constate une baisse de  64% du nombre de demandes de rendez-vous pour 1000 visites entre 2023 et 2024 (de 159 en 2023 à 57.3 en 2024) :  




```{=html}
<div class="tabwid"><style>.cl-b02c0e16{}.cl-b021340a{font-family:'Arial';font-size:11pt;font-weight:normal;font-style:normal;text-decoration:none;color:rgba(0, 0, 0, 1.00);background-color:transparent;}.cl-b024ae96{margin:0;text-align:right;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b024aea0{margin:0;text-align:left;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b024cac0{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b024caca{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b024cad4{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b024cad5{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}</style><table data-quarto-disable-processing='true' class='cl-b02c0e16'><thead><tr style="overflow-wrap:break-word;"><th class="cl-b024cac0"><p class="cl-b024ae96"><span class="cl-b021340a">2023 - RDV pour 1000 visites</span></p></th><th class="cl-b024cac0"><p class="cl-b024ae96"><span class="cl-b021340a">2024 - RDV pour 1000 visites</span></p></th><th class="cl-b024caca"><p class="cl-b024aea0"><span class="cl-b021340a">Evolution_rdv_pour_1000_visites</span></p></th></tr></thead><tbody><tr style="overflow-wrap:break-word;"><td class="cl-b024cad4"><p class="cl-b024ae96"><span class="cl-b021340a">159,294</span></p></td><td class="cl-b024cad4"><p class="cl-b024ae96"><span class="cl-b021340a">57,29231</span></p></td><td class="cl-b024cad5"><p class="cl-b024aea0"><span class="cl-b021340a">-64%</span></p></td></tr></tbody></table></div>
```

## Lien avec l'affichage des données IJ

*   **Demandes de rendez-vous**: Lorsque les formations ont un affichage des données IJ en 2024, on constate une baisse de 24% des demandes de rendez-vous. A l'inverse, lorsque les données IJ ne sont pas disponibles en 2024, on constate une hausse de 74% des demandes de rendez-vous.  

*   **Visites**:  Lorsque les formations ont un affichage des données IJ en 2024, on constate une hausse de 135% des visites de fiches formation. Lorsque les données IJ ne sont pas disponibles en 2024, on constate que cette hausse est encore plus forte avec 251% entre les deux périodes.  

*   **Demandes de rendez-vous pour 1000 visites**:  Rapportées aux visites, les demandes de rendez-vous pour 1000 visites sont à la baisse que les données IJ soient exposées ou non. Cette baisse est néanmoins beaucoup plus marquée concernant les formations dont les données IJ sont exposées (-68% contre - 50%).  


<table class=" lightable-paper" style='font-family: "Arial Narrow", arial, helvetica, sans-serif; margin-left: auto; margin-right: auto;'>
 <thead>
<tr>
<th style="empty-cells: hide;" colspan="1"></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Visites</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv pour 1000 visites</div></th>
</tr>
  <tr>
   <th style="text-align:left;"> Affichage des données IJ en 2024 </th>
   <th style="text-align:right;"> 2023 </th>
   <th style="text-align:right;"> 2024 </th>
   <th style="text-align:left;"> Evolution </th>
   <th style="text-align:right;"> 2023 </th>
   <th style="text-align:right;"> 2024 </th>
   <th style="text-align:left;"> Evolution </th>
   <th style="text-align:right;"> 2023 </th>
   <th style="text-align:right;"> 2024 </th>
   <th style="text-align:left;"> Evolution </th>
  </tr>
 </thead>
<tbody>
  <tr>
   <td style="text-align:left;"> Non </td>
   <td style="text-align:right;"> 1265 </td>
   <td style="text-align:right;"> 2199 </td>
   <td style="text-align:left;"> +74% </td>
   <td style="text-align:right;"> 12249 </td>
   <td style="text-align:right;"> 42991 </td>
   <td style="text-align:left;"> +251% </td>
   <td style="text-align:right;"> 103 </td>
   <td style="text-align:right;"> 51 </td>
   <td style="text-align:left;"> -50% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Oui </td>
   <td style="text-align:right;"> 3834 </td>
   <td style="text-align:right;"> 2927 </td>
   <td style="text-align:left;"> -24% </td>
   <td style="text-align:right;"> 19761 </td>
   <td style="text-align:right;"> 46480 </td>
   <td style="text-align:left;"> +135% </td>
   <td style="text-align:right;"> 194 </td>
   <td style="text-align:right;"> 63 </td>
   <td style="text-align:left;"> -68% </td>
  </tr>
</tbody>
</table>



## Lien avec le niveau de formation

*   **Demandes de rendez-vous**: Les formations infra-bac voient une hausse de 101% des demandes de rendez-vous entre 2023 et 2024. A l'inverse, les formations post-bac voient une baisse de 25% des demandes de rendez-vous entre 2023 et 2024.  

*   **Visites**: L'évolution des visites des fiches formation est assez proche entre les formations post-bac et infra-bac (resp. +175% et +187%).  

*   **Demandes de rendez-vous pour 1000 visites**: Il en découle une baisse beaucoup plus importante des demandes de rendez-vous pour 1000 visites concernant les formations post-bac (-73% vs -30%).  



```{=html}
<div class="tabwid"><style>.cl-b087b2de{}.cl-b07f701a{font-family:'Arial';font-size:11pt;font-weight:normal;font-style:normal;text-decoration:none;color:rgba(0, 0, 0, 1.00);background-color:transparent;}.cl-b08272ce{margin:0;text-align:left;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b08272d8{margin:0;text-align:right;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b08287d2{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b08287dc{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b08287e6{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b08287f0{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b08287fa{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b08287fb{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}</style><table data-quarto-disable-processing='true' class='cl-b087b2de'><thead><tr style="overflow-wrap:break-word;"><th class="cl-b08287d2"><p class="cl-b08272ce"><span class="cl-b07f701a"></span></p></th><th  colspan="3"class="cl-b08287dc"><p class="cl-b08272d8"><span class="cl-b07f701a">Demandes de rdv</span></p></th><th  colspan="3"class="cl-b08287dc"><p class="cl-b08272d8"><span class="cl-b07f701a">Visites</span></p></th><th  colspan="3"class="cl-b08287dc"><p class="cl-b08272d8"><span class="cl-b07f701a">Demandes de rdv pour 1000 visites</span></p></th></tr><tr style="overflow-wrap:break-word;"><th class="cl-b08287d2"><p class="cl-b08272ce"><span class="cl-b07f701a">Avant/Après le bac</span></p></th><th class="cl-b08287dc"><p class="cl-b08272d8"><span class="cl-b07f701a">2023</span></p></th><th class="cl-b08287dc"><p class="cl-b08272d8"><span class="cl-b07f701a">2024</span></p></th><th class="cl-b08287d2"><p class="cl-b08272ce"><span class="cl-b07f701a">Evolution</span></p></th><th class="cl-b08287dc"><p class="cl-b08272d8"><span class="cl-b07f701a">2023</span></p></th><th class="cl-b08287dc"><p class="cl-b08272d8"><span class="cl-b07f701a">2024</span></p></th><th class="cl-b08287d2"><p class="cl-b08272ce"><span class="cl-b07f701a">Evolution</span></p></th><th class="cl-b08287dc"><p class="cl-b08272d8"><span class="cl-b07f701a">2023</span></p></th><th class="cl-b08287dc"><p class="cl-b08272d8"><span class="cl-b07f701a">2024</span></p></th><th class="cl-b08287d2"><p class="cl-b08272ce"><span class="cl-b07f701a">Evolution</span></p></th></tr></thead><tbody><tr style="overflow-wrap:break-word;"><td class="cl-b08287e6"><p class="cl-b08272ce"><span class="cl-b07f701a">Avant le bac</span></p></td><td class="cl-b08287f0"><p class="cl-b08272d8"><span class="cl-b07f701a">1 029</span></p></td><td class="cl-b08287f0"><p class="cl-b08272d8"><span class="cl-b07f701a">2 066</span></p></td><td class="cl-b08287e6"><p class="cl-b08272ce"><span class="cl-b07f701a">+101%</span></p></td><td class="cl-b08287f0"><p class="cl-b08272d8"><span class="cl-b07f701a">11 187</span></p></td><td class="cl-b08287f0"><p class="cl-b08272d8"><span class="cl-b07f701a">32 113</span></p></td><td class="cl-b08287e6"><p class="cl-b08272ce"><span class="cl-b07f701a">+187%</span></p></td><td class="cl-b08287f0"><p class="cl-b08272d8"><span class="cl-b07f701a">92</span></p></td><td class="cl-b08287f0"><p class="cl-b08272d8"><span class="cl-b07f701a">64</span></p></td><td class="cl-b08287e6"><p class="cl-b08272ce"><span class="cl-b07f701a">-30%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b08287fa"><p class="cl-b08272ce"><span class="cl-b07f701a">Après le bac</span></p></td><td class="cl-b08287fb"><p class="cl-b08272d8"><span class="cl-b07f701a">4 070</span></p></td><td class="cl-b08287fb"><p class="cl-b08272d8"><span class="cl-b07f701a">3 060</span></p></td><td class="cl-b08287fa"><p class="cl-b08272ce"><span class="cl-b07f701a">-25%</span></p></td><td class="cl-b08287fb"><p class="cl-b08272d8"><span class="cl-b07f701a">20 823</span></p></td><td class="cl-b08287fb"><p class="cl-b08272d8"><span class="cl-b07f701a">57 358</span></p></td><td class="cl-b08287fa"><p class="cl-b08272ce"><span class="cl-b07f701a">+175%</span></p></td><td class="cl-b08287fb"><p class="cl-b08272d8"><span class="cl-b07f701a">195</span></p></td><td class="cl-b08287fb"><p class="cl-b08272d8"><span class="cl-b07f701a">53</span></p></td><td class="cl-b08287fa"><p class="cl-b08272ce"><span class="cl-b07f701a">-73%</span></p></td></tr></tbody></table></div>
```

### Demandes de rendez-vous pour 1000 visites sur la période

## Lien avec l'affichage des données IJ et le niveau de formation

*   **Demandes de rendez-vous**: Sans affichage de donneés IJ, la hause concerne les formations post et infra-bac même si on constate une plus forte hausse pour l'infra-bac (+209% contre +57%). 
A l'inverse, avec affichage des données IJ les formations post-bac voient une baisse de 56% des demandes de rendez-vous entre 2023 et 2024 alors que dans le même temps les formations infra-bac voient une hausse de 84% des demandes de rendez-vous. Cette hauuse est néanmoins inférieure à celle observée pour les formations infra-bac sans affichage de données IJ. 

*   **Visites**: Sans affichage de données IJ, l'évolution du nombre de visites est en hausse et relativement similaire pour les formations post et infra-bac (~ +250%). En revanche, cette hausse est pluys marquée pour les formations infra-bac ayant un affichage de données IJ que pour les formations post-bac ayant un affichage des données IJ (+167% vs +109%).    

*   **Demandes de rendez-vous pour 1000 visites**:  Ainsi, les formations infra-bac sans affichage de données IJ ont une baisse moins importante des demandes de rendez-vous pour 1000 visites que les formations infra-bac avec exposition des données IJ. Il en va de même pour les formations post-bac.  



```{=html}
<div class="tabwid"><style>.cl-b0c75466{}.cl-b0bdbe92{font-family:'Arial';font-size:11pt;font-weight:normal;font-style:normal;text-decoration:none;color:rgba(0, 0, 0, 1.00);background-color:transparent;}.cl-b0c1530e{margin:0;text-align:left;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b0c15322{margin:0;text-align:right;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b0c1670e{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b0c16718{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b0c16722{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b0c1672c{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b0c16736{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b0c16737{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}</style><table data-quarto-disable-processing='true' class='cl-b0c75466'><thead><tr style="overflow-wrap:break-word;"><th class="cl-b0c1670e"><p class="cl-b0c1530e"><span class="cl-b0bdbe92"></span></p></th><th class="cl-b0c1670e"><p class="cl-b0c1530e"><span class="cl-b0bdbe92"></span></p></th><th  colspan="3"class="cl-b0c16718"><p class="cl-b0c15322"><span class="cl-b0bdbe92">Demandes de rdv</span></p></th><th  colspan="3"class="cl-b0c16718"><p class="cl-b0c15322"><span class="cl-b0bdbe92">Visites</span></p></th><th  colspan="3"class="cl-b0c16718"><p class="cl-b0c15322"><span class="cl-b0bdbe92">Demandes de rdv pour 1000 visites</span></p></th></tr><tr style="overflow-wrap:break-word;"><th class="cl-b0c1670e"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Affichage des données IJ en 2024</span></p></th><th class="cl-b0c1670e"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Avant/Après le bac</span></p></th><th class="cl-b0c16718"><p class="cl-b0c15322"><span class="cl-b0bdbe92">2023</span></p></th><th class="cl-b0c16718"><p class="cl-b0c15322"><span class="cl-b0bdbe92">2024</span></p></th><th class="cl-b0c1670e"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Evolution</span></p></th><th class="cl-b0c16718"><p class="cl-b0c15322"><span class="cl-b0bdbe92">2023</span></p></th><th class="cl-b0c16718"><p class="cl-b0c15322"><span class="cl-b0bdbe92">2024</span></p></th><th class="cl-b0c1670e"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Evolution</span></p></th><th class="cl-b0c16718"><p class="cl-b0c15322"><span class="cl-b0bdbe92">2023</span></p></th><th class="cl-b0c16718"><p class="cl-b0c15322"><span class="cl-b0bdbe92">2024</span></p></th><th class="cl-b0c1670e"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Evolution</span></p></th></tr></thead><tbody><tr style="overflow-wrap:break-word;"><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Non</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Avant le bac</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">140</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">432</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">+209%</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">2 536</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">8 945</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">+252.7%</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">55</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">48</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">-13%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Non</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Après le bac</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">1 125</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">1 767</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">+57%</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">9 713</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">34 046</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">+250.5%</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">116</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">52</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">-55%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Oui</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Avant le bac</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">889</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">1 634</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">+84%</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">8 651</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">23 168</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">+167.8%</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">103</span></p></td><td class="cl-b0c1672c"><p class="cl-b0c15322"><span class="cl-b0bdbe92">71</span></p></td><td class="cl-b0c16722"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">-31%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b0c16736"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Oui</span></p></td><td class="cl-b0c16736"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">Après le bac</span></p></td><td class="cl-b0c16737"><p class="cl-b0c15322"><span class="cl-b0bdbe92">2 945</span></p></td><td class="cl-b0c16737"><p class="cl-b0c15322"><span class="cl-b0bdbe92">1 293</span></p></td><td class="cl-b0c16736"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">-56%</span></p></td><td class="cl-b0c16737"><p class="cl-b0c15322"><span class="cl-b0bdbe92">11 110</span></p></td><td class="cl-b0c16737"><p class="cl-b0c15322"><span class="cl-b0bdbe92">23 312</span></p></td><td class="cl-b0c16736"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">+109.8%</span></p></td><td class="cl-b0c16737"><p class="cl-b0c15322"><span class="cl-b0bdbe92">265</span></p></td><td class="cl-b0c16737"><p class="cl-b0c15322"><span class="cl-b0bdbe92">55</span></p></td><td class="cl-b0c16736"><p class="cl-b0c1530e"><span class="cl-b0bdbe92">-79%</span></p></td></tr></tbody></table></div>
```


## Zoom sur les formations ayant un affichage de données IJ en 2024

### Lien avec le niveau de formation et le taux de devenir favorable






<!--10% des formations ont un taux de devenir favorable inférieur à 68% et 25% des formations ont un taux de devenir favorable inférieur à 74%.

Un taux de devenir favorable faible (Q25: premier quartile) correspond à une valeur de 72% pour l’infra-bac et 78% pour le post-bac.-->

L'arbre de décision suivant tend à montrer que les utilisateurs demandent plus de rendez-vous lorsque le taux de devenir favorable est compris entre 73 et 83%.

![](impact_lba_files/figure-html/unnamed-chunk-7-1.png)<!-- -->



```{=html}
<div class="tabwid"><style>.cl-b12aa82c{}.cl-b1192d04{font-family:'Arial';font-size:11pt;font-weight:normal;font-style:normal;text-decoration:none;color:rgba(0, 0, 0, 1.00);background-color:transparent;}.cl-b123f432{margin:0;text-align:left;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b123f446{margin:0;text-align:right;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b1240d14{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1240d1e{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1240d1f{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1240d20{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1240d28{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1240d29{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}</style><table data-quarto-disable-processing='true' class='cl-b12aa82c'><thead><tr style="overflow-wrap:break-word;"><th class="cl-b1240d14"><p class="cl-b123f432"><span class="cl-b1192d04"></span></p></th><th class="cl-b1240d14"><p class="cl-b123f432"><span class="cl-b1192d04"></span></p></th><th  colspan="3"class="cl-b1240d1e"><p class="cl-b123f446"><span class="cl-b1192d04">Demandes de rdv</span></p></th><th  colspan="3"class="cl-b1240d1e"><p class="cl-b123f446"><span class="cl-b1192d04">Visites</span></p></th><th  colspan="3"class="cl-b1240d1e"><p class="cl-b123f446"><span class="cl-b1192d04">Demandes de rdv pour 1000 visites</span></p></th></tr><tr style="overflow-wrap:break-word;"><th class="cl-b1240d14"><p class="cl-b123f432"><span class="cl-b1192d04">Avant/Après le bac</span></p></th><th class="cl-b1240d14"><p class="cl-b123f432"><span class="cl-b1192d04">Groupe de taux de devenir favorable</span></p></th><th class="cl-b1240d1e"><p class="cl-b123f446"><span class="cl-b1192d04">2023</span></p></th><th class="cl-b1240d1e"><p class="cl-b123f446"><span class="cl-b1192d04">2024</span></p></th><th class="cl-b1240d14"><p class="cl-b123f432"><span class="cl-b1192d04">Evolution</span></p></th><th class="cl-b1240d1e"><p class="cl-b123f446"><span class="cl-b1192d04">2023</span></p></th><th class="cl-b1240d1e"><p class="cl-b123f446"><span class="cl-b1192d04">2024</span></p></th><th class="cl-b1240d14"><p class="cl-b123f432"><span class="cl-b1192d04">Evolution</span></p></th><th class="cl-b1240d1e"><p class="cl-b123f446"><span class="cl-b1192d04">2023</span></p></th><th class="cl-b1240d1e"><p class="cl-b123f446"><span class="cl-b1192d04">2024</span></p></th><th class="cl-b1240d14"><p class="cl-b123f432"><span class="cl-b1192d04">Evolution</span></p></th></tr></thead><tbody><tr style="overflow-wrap:break-word;"><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">Avant le bac</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">Taux de devenir favorable compris entre 73 et 83%</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">465</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">763</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">+64.1%</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">4 305</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">10 596</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">+146%</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">108</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">72</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">-33.3%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">Avant le bac</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">Taux de devenir favorable supérieur à 83% ou inférieur à 73%</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">424</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">871</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">+105.4%</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">4 346</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">12 572</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">+189%</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">98</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">69</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">-29.6%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">Après le bac</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">Taux de devenir favorable compris entre 73 et 83%</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">1 604</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">729</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">-54.6%</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">5 716</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">11 451</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">+100%</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">281</span></p></td><td class="cl-b1240d20"><p class="cl-b123f446"><span class="cl-b1192d04">64</span></p></td><td class="cl-b1240d1f"><p class="cl-b123f432"><span class="cl-b1192d04">-77.2%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b1240d28"><p class="cl-b123f432"><span class="cl-b1192d04">Après le bac</span></p></td><td class="cl-b1240d28"><p class="cl-b123f432"><span class="cl-b1192d04">Taux de devenir favorable supérieur à 83% ou inférieur à 73%</span></p></td><td class="cl-b1240d29"><p class="cl-b123f446"><span class="cl-b1192d04">1 341</span></p></td><td class="cl-b1240d29"><p class="cl-b123f446"><span class="cl-b1192d04">564</span></p></td><td class="cl-b1240d28"><p class="cl-b123f432"><span class="cl-b1192d04">-57.9%</span></p></td><td class="cl-b1240d29"><p class="cl-b123f446"><span class="cl-b1192d04">5 394</span></p></td><td class="cl-b1240d29"><p class="cl-b123f446"><span class="cl-b1192d04">11 861</span></p></td><td class="cl-b1240d28"><p class="cl-b123f432"><span class="cl-b1192d04">+120%</span></p></td><td class="cl-b1240d29"><p class="cl-b123f446"><span class="cl-b1192d04">249</span></p></td><td class="cl-b1240d29"><p class="cl-b123f446"><span class="cl-b1192d04">48</span></p></td><td class="cl-b1240d28"><p class="cl-b123f432"><span class="cl-b1192d04">-80.7%</span></p></td></tr></tbody></table></div>
```



<!--*   **Demandes de rendez-vous**: Le premier quartile de taux de devenir favorable (72% pour l’infra-bac et 78% pour le post-bac) est discriminant pour les formations infra et post-bac. 

**Deux constats relativement proches à nuancer néanmoins:**

- **Pour les formations infra-bac:**
    
    Il y a une hausse plus importante des demandes de rendez-vous pour les formations ayant un faible taux de devenir favorable.
    
- **Pour les formations post-bac:**
    
    Il y a une baisse moins importante des demandes de rendez-vous pour les formations ayant un faible taux de devenir favorable.
    

Les formations post-bac ayant un faible taux de devenir favorable voient une baisse moins importante qu’au dessus de ce seuil (-56% contre -67%). De la même façon, concernant l’infra-bac, on constate une hausse plus importante des demandes de rendez-vous pour les formations ayant un faible taux de devenir favorable (+86% contre +27%).  

*   **Visites**:  
*   **Demandes de rendez-vous pour 1000 visites**:  



Explications possibles : 

1. Les futurs lycéens et étudiants sont peut-être plus dans une zone d’incertitude (incompréhension des données ou besoin de davantage d’informations) en dessous de 74% et sollicitent alors les établissements pour plus de renseignements.
2. Les vœux sur les plateformes d’affectation sont corrélés aux demandes de rendez-vous : il y a moins de demandes de rendez-vous car ce sont des formations qui intéressent moins.


En abaissant le seuil du taux de devenir favorable au 10ème quantile (Q10), le phénomène observé au seuil faible (Q25) s’accentue. Il y a une plus forte hausse des demandes de rendez-vous pour les formations post-bac ayant un très faible taux de devenir favorable et la baisse des demandes de rendez-vous est moins 
-->



### Lien avec le niveau de formation, le taux en emploi à 6 mois et le taux en formation

L'arbre de décision ci-dessous tend à montrer que le nombre de demandes de rendez-vous est en baisse si:  

*   Le taux en formation est supérieur ou égal à 23%,   
*   Le taux en emploi à 6 mois est suprieur ou égal à 81%,  
*   Le taux en formation est compris entre 15 et 23% et taux en emploi à 6 mois est compris entre 57 et 81%.  


![](impact_lba_files/figure-html/unnamed-chunk-10-1.png)<!-- -->




```{=html}
<div class="tabwid"><style>.cl-b17ba100{}.cl-b1732bf6{font-family:'Arial';font-size:11pt;font-weight:normal;font-style:normal;text-decoration:none;color:rgba(0, 0, 0, 1.00);background-color:transparent;}.cl-b175fdae{margin:0;text-align:left;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b175fdb8{margin:0;text-align:right;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);padding-bottom:5pt;padding-top:5pt;padding-left:5pt;padding-right:5pt;line-height: 1;background-color:transparent;}.cl-b176112c{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1761136{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 1.5pt solid rgba(102, 102, 102, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1761137{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1761140{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 0 solid rgba(0, 0, 0, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1761141{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}.cl-b1761142{width:0.75in;background-color:transparent;vertical-align: middle;border-bottom: 1.5pt solid rgba(102, 102, 102, 1.00);border-top: 0 solid rgba(0, 0, 0, 1.00);border-left: 0 solid rgba(0, 0, 0, 1.00);border-right: 0 solid rgba(0, 0, 0, 1.00);margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;}</style><table data-quarto-disable-processing='true' class='cl-b17ba100'><thead><tr style="overflow-wrap:break-word;"><th class="cl-b176112c"><p class="cl-b175fdae"><span class="cl-b1732bf6"></span></p></th><th class="cl-b176112c"><p class="cl-b175fdae"><span class="cl-b1732bf6"></span></p></th><th  colspan="3"class="cl-b1761136"><p class="cl-b175fdb8"><span class="cl-b1732bf6">Demandes de rdv</span></p></th><th  colspan="3"class="cl-b1761136"><p class="cl-b175fdb8"><span class="cl-b1732bf6">Visites</span></p></th><th  colspan="3"class="cl-b1761136"><p class="cl-b175fdb8"><span class="cl-b1732bf6">Demandes de rdv pour 1000 visites</span></p></th></tr><tr style="overflow-wrap:break-word;"><th class="cl-b176112c"><p class="cl-b175fdae"><span class="cl-b1732bf6">Avant/Après le bac</span></p></th><th class="cl-b176112c"><p class="cl-b175fdae"><span class="cl-b1732bf6">Groupe de taux en emploi et en formation</span></p></th><th class="cl-b1761136"><p class="cl-b175fdb8"><span class="cl-b1732bf6">2023</span></p></th><th class="cl-b1761136"><p class="cl-b175fdb8"><span class="cl-b1732bf6">2024</span></p></th><th class="cl-b176112c"><p class="cl-b175fdae"><span class="cl-b1732bf6">Evolution</span></p></th><th class="cl-b1761136"><p class="cl-b175fdb8"><span class="cl-b1732bf6">2023</span></p></th><th class="cl-b1761136"><p class="cl-b175fdb8"><span class="cl-b1732bf6">2024</span></p></th><th class="cl-b176112c"><p class="cl-b175fdae"><span class="cl-b1732bf6">Evolution</span></p></th><th class="cl-b1761136"><p class="cl-b175fdb8"><span class="cl-b1732bf6">2023</span></p></th><th class="cl-b1761136"><p class="cl-b175fdb8"><span class="cl-b1732bf6">2024</span></p></th><th class="cl-b176112c"><p class="cl-b175fdae"><span class="cl-b1732bf6">Evolution</span></p></th></tr></thead><tbody><tr style="overflow-wrap:break-word;"><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">Avant le bac</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">Autres</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">170</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">507</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">+198%</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">2 160</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">6 632</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">+207.0%</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">79</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">76</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">-3.8%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">Avant le bac</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">Taux en empoi à 6 mois &gt;= 81%, taux en formation &gt;= 23 ou taux en formation est compris entre 15 et 23% et taux en emploi à 6 mois est compris entre 57 et 81%</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">719</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">1 127</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">+57%</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">6 491</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">16 536</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">+154.8%</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">111</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">68</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">-38.7%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">Après le bac</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">Autres</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">45</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">60</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">+33%</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">472</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">1 218</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">+158.1%</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">95</span></p></td><td class="cl-b1761140"><p class="cl-b175fdb8"><span class="cl-b1732bf6">49</span></p></td><td class="cl-b1761137"><p class="cl-b175fdae"><span class="cl-b1732bf6">-48.4%</span></p></td></tr><tr style="overflow-wrap:break-word;"><td class="cl-b1761141"><p class="cl-b175fdae"><span class="cl-b1732bf6">Après le bac</span></p></td><td class="cl-b1761141"><p class="cl-b175fdae"><span class="cl-b1732bf6">Taux en empoi à 6 mois &gt;= 81%, taux en formation &gt;= 23 ou taux en formation est compris entre 15 et 23% et taux en emploi à 6 mois est compris entre 57 et 81%</span></p></td><td class="cl-b1761142"><p class="cl-b175fdb8"><span class="cl-b1732bf6">2 900</span></p></td><td class="cl-b1761142"><p class="cl-b175fdb8"><span class="cl-b1732bf6">1 233</span></p></td><td class="cl-b1761141"><p class="cl-b175fdae"><span class="cl-b1732bf6">-57%</span></p></td><td class="cl-b1761142"><p class="cl-b175fdb8"><span class="cl-b1732bf6">10 638</span></p></td><td class="cl-b1761142"><p class="cl-b175fdb8"><span class="cl-b1732bf6">22 094</span></p></td><td class="cl-b1761141"><p class="cl-b175fdae"><span class="cl-b1732bf6">+107.7%</span></p></td><td class="cl-b1761142"><p class="cl-b175fdb8"><span class="cl-b1732bf6">273</span></p></td><td class="cl-b1761142"><p class="cl-b175fdb8"><span class="cl-b1732bf6">56</span></p></td><td class="cl-b1761141"><p class="cl-b175fdae"><span class="cl-b1732bf6">-79.5%</span></p></td></tr></tbody></table></div>
```

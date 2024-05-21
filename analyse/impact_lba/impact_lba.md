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



<table class=" lightable-paper" style='font-family: "Arial Narrow", arial, helvetica, sans-serif; margin-left: auto; margin-right: auto;'>
 <thead>
  <tr>
   <th style="text-align:right;"> 2023 - visiteurs </th>
   <th style="text-align:right;"> 2024 - visiteurs </th>
   <th style="text-align:left;"> Evolution_visiteurs </th>
  </tr>
 </thead>
<tbody>
  <tr>
   <td style="text-align:right;"> 32 010 </td>
   <td style="text-align:right;"> 89 471 </td>
   <td style="text-align:left;"> +180% </td>
  </tr>
</tbody>
</table>

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
   <td style="text-align:right;"> 5 099 </td>
   <td style="text-align:right;"> 5 126 </td>
   <td style="text-align:left;"> +1% </td>
  </tr>
</tbody>
</table>

### Demandes de rendez-vous pour 1000 visites sur la période

Pour ces formations, on constate une baisse de  64% du nombre de demandes de rendez-vous pour 1000 visites entre 2023 et 2024 (de 159 en 2023 à 57.3 en 2024) :  



<table class=" lightable-paper" style='font-family: "Arial Narrow", arial, helvetica, sans-serif; margin-left: auto; margin-right: auto;'>
 <thead>
  <tr>
   <th style="text-align:right;"> 2023 - RDV pour 1000 visites </th>
   <th style="text-align:right;"> 2024 - RDV pour 1000 visites </th>
   <th style="text-align:left;"> Evolution_rdv_pour_1000_visites </th>
  </tr>
 </thead>
<tbody>
  <tr>
   <td style="text-align:right;"> 159,294 </td>
   <td style="text-align:right;"> 57,29231 </td>
   <td style="text-align:left;"> -64% </td>
  </tr>
</tbody>
</table>

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
   <td style="text-align:right;"> 1 265 </td>
   <td style="text-align:right;"> 2 199 </td>
   <td style="text-align:left;"> +74% </td>
   <td style="text-align:right;"> 12 249 </td>
   <td style="text-align:right;"> 42 991 </td>
   <td style="text-align:left;"> +251% </td>
   <td style="text-align:right;"> 103 </td>
   <td style="text-align:right;"> 51 </td>
   <td style="text-align:left;"> -50% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Oui </td>
   <td style="text-align:right;"> 3 834 </td>
   <td style="text-align:right;"> 2 927 </td>
   <td style="text-align:left;"> -24% </td>
   <td style="text-align:right;"> 19 761 </td>
   <td style="text-align:right;"> 46 480 </td>
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


<table class=" lightable-paper" style='font-family: "Arial Narrow", arial, helvetica, sans-serif; margin-left: auto; margin-right: auto;'>
 <thead>
<tr>
<th style="empty-cells: hide;" colspan="1"></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Visites</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv pour 1000 visites</div></th>
</tr>
  <tr>
   <th style="text-align:left;"> Avant/Après le bac </th>
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
   <td style="text-align:left;"> Avant le bac </td>
   <td style="text-align:right;"> 1 029 </td>
   <td style="text-align:right;"> 2 066 </td>
   <td style="text-align:left;"> +101% </td>
   <td style="text-align:right;"> 11 187 </td>
   <td style="text-align:right;"> 32 113 </td>
   <td style="text-align:left;"> +187% </td>
   <td style="text-align:right;"> 92 </td>
   <td style="text-align:right;"> 64 </td>
   <td style="text-align:left;"> -30% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Après le bac </td>
   <td style="text-align:right;"> 4 070 </td>
   <td style="text-align:right;"> 3 060 </td>
   <td style="text-align:left;"> -25% </td>
   <td style="text-align:right;"> 20 823 </td>
   <td style="text-align:right;"> 57 358 </td>
   <td style="text-align:left;"> +175% </td>
   <td style="text-align:right;"> 195 </td>
   <td style="text-align:right;"> 53 </td>
   <td style="text-align:left;"> -73% </td>
  </tr>
</tbody>
</table>

### Demandes de rendez-vous pour 1000 visites sur la période

## Lien avec l'affichage des données IJ et le niveau de formation

*   **Demandes de rendez-vous**: Sans affichage de donneés IJ, la hause concerne les formations post et infra-bac même si on constate une plus forte hausse pour l'infra-bac (+209% contre +57%). 
A l'inverse, avec affichage des données IJ les formations post-bac voient une baisse de 56% des demandes de rendez-vous entre 2023 et 2024 alors que dans le même temps les formations infra-bac voient une hausse de 84% des demandes de rendez-vous. Cette hauuse est néanmoins inférieure à celle observée pour les formations infra-bac sans affichage de données IJ. 

*   **Visites**: Sans affichage de données IJ, l'évolution du nombre de visites est en hausse et relativement similaire pour les formations post et infra-bac (~ +250%). En revanche, cette hausse est pluys marquée pour les formations infra-bac ayant un affichage de données IJ que pour les formations post-bac ayant un affichage des données IJ (+167% vs +109%).    

*   **Demandes de rendez-vous pour 1000 visites**:  Ainsi, les formations infra-bac sans affichage de données IJ ont une baisse moins importante des demandes de rendez-vous pour 1000 visites que les formations infra-bac avec exposition des données IJ. Il en va de même pour les formations post-bac.  


<table class=" lightable-paper" style='font-family: "Arial Narrow", arial, helvetica, sans-serif; margin-left: auto; margin-right: auto;'>
 <thead>
<tr>
<th style="empty-cells: hide;" colspan="1"></th>
<th style="empty-cells: hide;" colspan="1"></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Visites</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv pour 1000 visites</div></th>
</tr>
  <tr>
   <th style="text-align:left;"> Affichage des données IJ en 2024 </th>
   <th style="text-align:left;"> Avant/Après le bac </th>
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
   <td style="text-align:left;"> Avant le bac </td>
   <td style="text-align:right;"> 140 </td>
   <td style="text-align:right;"> 432 </td>
   <td style="text-align:left;"> +209% </td>
   <td style="text-align:right;"> 2 536 </td>
   <td style="text-align:right;"> 8 945 </td>
   <td style="text-align:left;"> +252.7% </td>
   <td style="text-align:right;"> 55 </td>
   <td style="text-align:right;"> 48 </td>
   <td style="text-align:left;"> -13% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Non </td>
   <td style="text-align:left;"> Après le bac </td>
   <td style="text-align:right;"> 1 125 </td>
   <td style="text-align:right;"> 1 767 </td>
   <td style="text-align:left;"> +57% </td>
   <td style="text-align:right;"> 9 713 </td>
   <td style="text-align:right;"> 34 046 </td>
   <td style="text-align:left;"> +250.5% </td>
   <td style="text-align:right;"> 116 </td>
   <td style="text-align:right;"> 52 </td>
   <td style="text-align:left;"> -55% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Oui </td>
   <td style="text-align:left;"> Avant le bac </td>
   <td style="text-align:right;"> 889 </td>
   <td style="text-align:right;"> 1 634 </td>
   <td style="text-align:left;"> +84% </td>
   <td style="text-align:right;"> 8 651 </td>
   <td style="text-align:right;"> 23 168 </td>
   <td style="text-align:left;"> +167.8% </td>
   <td style="text-align:right;"> 103 </td>
   <td style="text-align:right;"> 71 </td>
   <td style="text-align:left;"> -31% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Oui </td>
   <td style="text-align:left;"> Après le bac </td>
   <td style="text-align:right;"> 2 945 </td>
   <td style="text-align:right;"> 1 293 </td>
   <td style="text-align:left;"> -56% </td>
   <td style="text-align:right;"> 11 110 </td>
   <td style="text-align:right;"> 23 312 </td>
   <td style="text-align:left;"> +109.8% </td>
   <td style="text-align:right;"> 265 </td>
   <td style="text-align:right;"> 55 </td>
   <td style="text-align:left;"> -79% </td>
  </tr>
</tbody>
</table>


## Zoom sur les formations ayant un affichage de données IJ en 2024

### Lien avec le niveau de formation et le taux de devenir favorable






<!--10% des formations ont un taux de devenir favorable inférieur à 68% et 25% des formations ont un taux de devenir favorable inférieur à 74%.

Un taux de devenir favorable faible (Q25: premier quartile) correspond à une valeur de 72% pour l’infra-bac et 78% pour le post-bac.-->

L'arbre de décision suivant tend à montrer que les utilisateurs demandent plus de rendez-vous lorsque le taux de devenir favorable est compris entre 73 et 83%.

![](impact_lba_files/figure-html/unnamed-chunk-7-1.png)<!-- -->


<table class=" lightable-paper" style='font-family: "Arial Narrow", arial, helvetica, sans-serif; margin-left: auto; margin-right: auto;'>
 <thead>
<tr>
<th style="empty-cells: hide;" colspan="1"></th>
<th style="empty-cells: hide;" colspan="1"></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Visites</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv pour 1000 visites</div></th>
</tr>
  <tr>
   <th style="text-align:left;"> Avant/Après le bac </th>
   <th style="text-align:left;"> Groupe de taux de devenir favorable </th>
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
   <td style="text-align:left;"> Avant le bac </td>
   <td style="text-align:left;"> Taux de devenir favorable compris entre 73 et 83% </td>
   <td style="text-align:right;"> 465 </td>
   <td style="text-align:right;"> 763 </td>
   <td style="text-align:left;"> +64.1% </td>
   <td style="text-align:right;"> 4 305 </td>
   <td style="text-align:right;"> 10 596 </td>
   <td style="text-align:left;"> +146% </td>
   <td style="text-align:right;"> 108 </td>
   <td style="text-align:right;"> 72 </td>
   <td style="text-align:left;"> -33.3% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Avant le bac </td>
   <td style="text-align:left;"> Taux de devenir favorable supérieur à 83% ou inférieur à 73% </td>
   <td style="text-align:right;"> 424 </td>
   <td style="text-align:right;"> 871 </td>
   <td style="text-align:left;"> +105.4% </td>
   <td style="text-align:right;"> 4 346 </td>
   <td style="text-align:right;"> 12 572 </td>
   <td style="text-align:left;"> +189% </td>
   <td style="text-align:right;"> 98 </td>
   <td style="text-align:right;"> 69 </td>
   <td style="text-align:left;"> -29.6% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Après le bac </td>
   <td style="text-align:left;"> Taux de devenir favorable compris entre 73 et 83% </td>
   <td style="text-align:right;"> 1 604 </td>
   <td style="text-align:right;"> 729 </td>
   <td style="text-align:left;"> -54.6% </td>
   <td style="text-align:right;"> 5 716 </td>
   <td style="text-align:right;"> 11 451 </td>
   <td style="text-align:left;"> +100% </td>
   <td style="text-align:right;"> 281 </td>
   <td style="text-align:right;"> 64 </td>
   <td style="text-align:left;"> -77.2% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Après le bac </td>
   <td style="text-align:left;"> Taux de devenir favorable supérieur à 83% ou inférieur à 73% </td>
   <td style="text-align:right;"> 1 341 </td>
   <td style="text-align:right;"> 564 </td>
   <td style="text-align:left;"> -57.9% </td>
   <td style="text-align:right;"> 5 394 </td>
   <td style="text-align:right;"> 11 861 </td>
   <td style="text-align:left;"> +120% </td>
   <td style="text-align:right;"> 249 </td>
   <td style="text-align:right;"> 48 </td>
   <td style="text-align:left;"> -80.7% </td>
  </tr>
</tbody>
</table>



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



<table class=" lightable-paper" style='font-family: "Arial Narrow", arial, helvetica, sans-serif; margin-left: auto; margin-right: auto;'>
 <thead>
<tr>
<th style="empty-cells: hide;" colspan="1"></th>
<th style="empty-cells: hide;" colspan="1"></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Visites</div></th>
<th style="padding-bottom:0; padding-left:3px;padding-right:3px;text-align: center; " colspan="3"><div style="border-bottom: 1px solid #00000020; padding-bottom: 5px; ">Demandes de rdv pour 1000 visites</div></th>
</tr>
  <tr>
   <th style="text-align:left;"> Avant/Après le bac </th>
   <th style="text-align:left;"> Groupe de taux en emploi et en formation </th>
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
   <td style="text-align:left;"> Avant le bac </td>
   <td style="text-align:left;"> Autres </td>
   <td style="text-align:right;"> 170 </td>
   <td style="text-align:right;"> 507 </td>
   <td style="text-align:left;"> +198% </td>
   <td style="text-align:right;"> 2 160 </td>
   <td style="text-align:right;"> 6 632 </td>
   <td style="text-align:left;"> +207.0% </td>
   <td style="text-align:right;"> 79 </td>
   <td style="text-align:right;"> 76 </td>
   <td style="text-align:left;"> -3.8% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Avant le bac </td>
   <td style="text-align:left;"> Taux en empoi à 6 mois &gt;= 81%, taux en formation &gt;= 23 ou taux en formation est compris entre 15 et 23% et taux en emploi à 6 mois est compris entre 57 et 81% </td>
   <td style="text-align:right;"> 719 </td>
   <td style="text-align:right;"> 1 127 </td>
   <td style="text-align:left;"> +57% </td>
   <td style="text-align:right;"> 6 491 </td>
   <td style="text-align:right;"> 16 536 </td>
   <td style="text-align:left;"> +154.8% </td>
   <td style="text-align:right;"> 111 </td>
   <td style="text-align:right;"> 68 </td>
   <td style="text-align:left;"> -38.7% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Après le bac </td>
   <td style="text-align:left;"> Autres </td>
   <td style="text-align:right;"> 45 </td>
   <td style="text-align:right;"> 60 </td>
   <td style="text-align:left;"> +33% </td>
   <td style="text-align:right;"> 472 </td>
   <td style="text-align:right;"> 1 218 </td>
   <td style="text-align:left;"> +158.1% </td>
   <td style="text-align:right;"> 95 </td>
   <td style="text-align:right;"> 49 </td>
   <td style="text-align:left;"> -48.4% </td>
  </tr>
  <tr>
   <td style="text-align:left;"> Après le bac </td>
   <td style="text-align:left;"> Taux en empoi à 6 mois &gt;= 81%, taux en formation &gt;= 23 ou taux en formation est compris entre 15 et 23% et taux en emploi à 6 mois est compris entre 57 et 81% </td>
   <td style="text-align:right;"> 2 900 </td>
   <td style="text-align:right;"> 1 233 </td>
   <td style="text-align:left;"> -57% </td>
   <td style="text-align:right;"> 10 638 </td>
   <td style="text-align:right;"> 22 094 </td>
   <td style="text-align:left;"> +107.7% </td>
   <td style="text-align:right;"> 273 </td>
   <td style="text-align:right;"> 56 </td>
   <td style="text-align:left;"> -79.5% </td>
  </tr>
</tbody>
</table>

![Visualisation simplifiée de l'évolution des demandes de rendez-vous en fonction du taux d'emploi à 6 mois et du taux en formation](images/graphique_simplifie.jpg)

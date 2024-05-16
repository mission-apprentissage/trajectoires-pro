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




| 2023 - RDV| 2024 - RDV|Evolution_RDV |
|----------:|----------:|:-------------|
|       5099|       5126|+1%           |

### Demandes de rendez-vous pour 1000 visites sur la période

Pour ces formations, on constate une baisse de  64% du nombre de demandes de rendez-vous pour 1000 visites entre 2023 et 2024 (de 159 en 2023 à 57.3 en 2024) :  




| 2023 - RDV pour 1000 visites| 2024 - RDV pour 1000 visites|Evolution_rdv_pour_1000_visites |
|----------------------------:|----------------------------:|:-------------------------------|
|                      159.294|                     57.29231|-64%                            |

## Lien avec l'affichage des données IJ

*   **Demandes de rendez-vous**: Lorsque les formations ont un affichage des données IJ en 2024, on constate une baisse de 24% des demandes de rendez-vous. A l'inverse, lorsque les données IJ ne sont pas disponibles en 2024, on constate une hausse de 74% des demandes de rendez-vous.  

*   **Visites**:  Lorsque les formations ont un affichage des données IJ en 2024, on constate une hausse de 135% des visites de fiches formation. Lorsque les données IJ ne sont pas disponibles en 2024, on constate que cette hausse est encore plus forte avec 251% entre les deux périodes.  

*   **Demandes de rendez-vous pour 1000 visites**:  Rapportées aux visites, les demandes de rendez-vous pour 1000 visites sont à la baisse que les données IJ soient exposées ou non. Cette baisse est néanmoins beaucoup plus marquée concernant les formations dont les données IJ sont exposées (-68% contre - 50%).  



```{=html}
<div class="datatables html-widget html-fill-item" id="htmlwidget-0d1adf8400456775c968" style="width:100%;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-0d1adf8400456775c968">{"x":{"filter":"none","vertical":false,"class":"display","data":[["Non","Oui"],[1265,3834],[2199,2927],["+74%","-24%"],[12249,19761],[42991,46480],["+251%","+135%"],[103,194],[51,63],["-50%","-68%"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th rowspan=\"2\">Affichage des données IJ en 2024<\/th>\n      <th colspan=\"3\">Demandes de rdv<\/th>\n      <th colspan=\"3\">Visites<\/th>\n      <th colspan=\"3\">Demandes de rdv pour 1000 Visites<\/th>\n    <\/tr>\n    <tr>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"dom":"t","ordering":false,"columnDefs":[{"className":"dt-right","targets":[1,2,4,5,7,8]},{"name":"Affichage des données IJ en 2024","targets":0},{"name":"2023 - RDV","targets":1},{"name":"2024 - RDV","targets":2},{"name":"Evolution_RDV","targets":3},{"name":"2023 - visiteurs","targets":4},{"name":"2024 - visiteurs","targets":5},{"name":"Evolution_visiteurs","targets":6},{"name":"2023 - RDV pour 1000 visites","targets":7},{"name":"2024 - RDV pour 1000 visites","targets":8},{"name":"Evolution_rdv_pour_1000_visites","targets":9}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>
```



## Lien avec le niveau de formation

*   **Demandes de rendez-vous**: Les formations infra-bac voient une hausse de 101% des demandes de rendez-vous entre 2023 et 2024. A l'inverse, les formations post-bac voient une baisse de 25% des demandes de rendez-vous entre 2023 et 2024.  

*   **Visites**: L'évolution des visites des fiches formation est assez proche entre les formations post-bac et infra-bac (resp. +175% et +187%).  

*   **Demandes de rendez-vous pour 1000 visites**: Il en découle une baisse beaucoup plus importante des demandes de rendez-vous pour 1000 visites concernant les formations post-bac (-73% vs -30%).  



```{=html}
<div class="datatables html-widget html-fill-item" id="htmlwidget-574582210d555da3d26c" style="width:100%;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-574582210d555da3d26c">{"x":{"filter":"none","vertical":false,"class":"display","data":[["Avant le bac","Après le bac"],[1029,4070],[2066,3060],["+101%","-25%"],[11187,20823],[32113,57358],["+187%","+175%"],[92,195],[64,53],["-30%","-73%"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th rowspan=\"2\">Avant/Après le bac<\/th>\n      <th colspan=\"3\">Demandes de rdv<\/th>\n      <th colspan=\"3\">Visites<\/th>\n      <th colspan=\"3\">Demandes de rdv pour 1000 Visites<\/th>\n    <\/tr>\n    <tr>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"dom":"t","ordering":false,"columnDefs":[{"className":"dt-right","targets":[1,2,4,5,7,8]},{"name":"Avant/Après le bac","targets":0},{"name":"2023 - RDV","targets":1},{"name":"2024 - RDV","targets":2},{"name":"Evolution_RDV","targets":3},{"name":"2023 - visiteurs","targets":4},{"name":"2024 - visiteurs","targets":5},{"name":"Evolution_visiteurs","targets":6},{"name":"2023 - RDV pour 1000 visites","targets":7},{"name":"2024 - RDV pour 1000 visites","targets":8},{"name":"Evolution_rdv_pour_1000_visites","targets":9}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>
```

### Demandes de rendez-vous pour 1000 visites sur la période

## Lien avec l'affichage des données IJ et le niveau de formation

*   **Demandes de rendez-vous**: Sans affichage de donneés IJ, la hause concerne les formations post et infra-bac même si on constate une plus forte hausse pour l'infra-bac (+209% contre +57%). 
A l'inverse, avec affichage des données IJ les formations post-bac voient une baisse de 56% des demandes de rendez-vous entre 2023 et 2024 alors que dans le même temps les formations infra-bac voient une hausse de 84% des demandes de rendez-vous. Cette hauuse est néanmoins inférieure à celle observée pour les formations infra-bac sans affichage de données IJ. 

*   **Visites**: Sans affichage de données IJ, l'évolution du nombre de visites est en hausse et relativement similaire pour les formations post et infra-bac (~ +250%). En revanche, cette hausse est pluys marquée pour les formations infra-bac ayant un affichage de données IJ que pour les formations post-bac ayant un affichage des données IJ (+167% vs +109%).    

*   **Demandes de rendez-vous pour 1000 visites**:  Ainsi, les formations infra-bac sans affichage de données IJ ont une baisse moins importante des demandes de rendez-vous pour 1000 visites que les formations infra-bac avec exposition des données IJ. Il en va de même pour les formations post-bac.  



```{=html}
<div class="datatables html-widget html-fill-item" id="htmlwidget-f7b35e19b21ad669a0d3" style="width:100%;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-f7b35e19b21ad669a0d3">{"x":{"filter":"none","vertical":false,"class":"display","data":[["Non","Non","Oui","Oui"],["Avant le bac","Après le bac","Avant le bac","Après le bac"],[140,1125,889,2945],[432,1767,1634,1293],["+209%","+57%","+84%","-56%"],[2536,9713,8651,11110],[8945,34046,23168,23312],["+252.7%","+250.5%","+167.8%","+109.8%"],[55,116,103,265],[48,52,71,55],["-13%","-55%","-31%","-79%"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th rowspan=\"2\">Affichage des données IJ en 2024<\/th>\n      <th rowspan=\"2\">Avant/Après le bac<\/th>\n      <th colspan=\"3\">Demandes de rdv<\/th>\n      <th colspan=\"3\">Visites<\/th>\n      <th colspan=\"3\">Demandes de rdv pour 1000 Visites<\/th>\n    <\/tr>\n    <tr>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"dom":"t","ordering":false,"columnDefs":[{"className":"dt-right","targets":[2,3,5,6,8,9]},{"name":"Affichage des données IJ en 2024","targets":0},{"name":"Avant/Après le bac","targets":1},{"name":"2023 - RDV","targets":2},{"name":"2024 - RDV","targets":3},{"name":"Evolution_RDV","targets":4},{"name":"2023 - visiteurs","targets":5},{"name":"2024 - visiteurs","targets":6},{"name":"Evolution_visiteurs","targets":7},{"name":"2023 - RDV pour 1000 visites","targets":8},{"name":"2024 - RDV pour 1000 visites","targets":9},{"name":"Evolution_rdv_pour_1000_visites","targets":10}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>
```


## Zoom sur les formations ayant un affichage de données IJ en 2024

### Lien avec le niveau de formation et le taux de devenir favorable






<!--10% des formations ont un taux de devenir favorable inférieur à 68% et 25% des formations ont un taux de devenir favorable inférieur à 74%.

Un taux de devenir favorable faible (Q25: premier quartile) correspond à une valeur de 72% pour l’infra-bac et 78% pour le post-bac.-->

L'arbre de décision suivant tend à montrer que les utilisateurs demandent plus de rendez-vous lorsque le taux de devenir favorable est compris entre 73 et 83%.

![](impact_lba_files/figure-html/unnamed-chunk-7-1.png)<!-- -->



```{=html}
<div class="datatables html-widget html-fill-item" id="htmlwidget-8721a8e83d3d553e31ac" style="width:100%;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-8721a8e83d3d553e31ac">{"x":{"filter":"none","vertical":false,"class":"display","data":[["Avant le bac","Avant le bac","Après le bac","Après le bac"],["Taux de devenir favorable compris entre 73 et 83%","Taux de devenir favorable supérieur à 83% ou inférieur à 73%","Taux de devenir favorable compris entre 73 et 83%","Taux de devenir favorable supérieur à 83% ou inférieur à 73%"],[465,424,1604,1341],[763,871,729,564],["+64.1%","+105.4%","-54.6%","-57.9%"],[4305,4346,5716,5394],[10596,12572,11451,11861],["+146%","+189%","+100%","+120%"],[108,98,281,249],[72,69,64,48],["-33.3%","-29.6%","-77.2%","-80.7%"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th rowspan=\"2\">Avant/Après le bac<\/th>\n      <th rowspan=\"2\">Groupe de taux de devenir favorable<\/th>\n      <th colspan=\"3\">Demandes de rdv<\/th>\n      <th colspan=\"3\">Visites<\/th>\n      <th colspan=\"3\">Demandes de rdv pour 1000 Visites<\/th>\n    <\/tr>\n    <tr>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"dom":"t","ordering":false,"columnDefs":[{"className":"dt-right","targets":[2,3,5,6,8,9]},{"name":"Avant/Après le bac","targets":0},{"name":"Groupe de taux de devenir favorable","targets":1},{"name":"2023 - RDV","targets":2},{"name":"2024 - RDV","targets":3},{"name":"Evolution.x","targets":4},{"name":"2023 - visiteurs","targets":5},{"name":"2024 - visiteurs","targets":6},{"name":"Evolution.y","targets":7},{"name":"2023 - RDV pour 1000 visites","targets":8},{"name":"2024 - RDV pour 1000 visites","targets":9},{"name":"Evolution_rdv_pour_1000_visites","targets":10}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>
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
<div class="datatables html-widget html-fill-item" id="htmlwidget-2c4d1a2c402b7a28e3b6" style="width:100%;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-2c4d1a2c402b7a28e3b6">{"x":{"filter":"none","vertical":false,"class":"display","data":[["Avant le bac","Avant le bac","Après le bac","Après le bac"],["Autres","Taux en empoi à 6 mois &gt;= 81%, taux en formation &gt;= 23 ou taux en formation est compris entre 15 et 23% et taux en emploi à 6 mois est compris entre 57 et 81%","Autres","Taux en empoi à 6 mois &gt;= 81%, taux en formation &gt;= 23 ou taux en formation est compris entre 15 et 23% et taux en emploi à 6 mois est compris entre 57 et 81%"],[170,719,45,2900],[507,1127,60,1233],["+198%","+57%","+33%","-57%"],[2160,6491,472,10638],[6632,16536,1218,22094],["+207.0%","+154.8%","+158.1%","+107.7%"],[79,111,95,273],[76,68,49,56],["-3.8%","-38.7%","-48.4%","-79.5%"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th rowspan=\"2\">Avant/Après le bac<\/th>\n      <th rowspan=\"2\">Groupe de taux en emploi et en formation<\/th>\n      <th colspan=\"3\">Demandes de rdv<\/th>\n      <th colspan=\"3\">Visites<\/th>\n      <th colspan=\"3\">Demandes de rdv pour 1000 Visites<\/th>\n    <\/tr>\n    <tr>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n      <th>2023<\/th>\n      <th>2024<\/th>\n      <th>Evolution<\/th>\n    <\/tr>\n  <\/thead>\n<\/table>","options":{"dom":"t","ordering":false,"columnDefs":[{"className":"dt-right","targets":[2,3,5,6,8,9]},{"name":"Avant/Après le bac","targets":0},{"name":"Groupe de taux de devenir favorable","targets":1},{"name":"2023 - RDV","targets":2},{"name":"2024 - RDV","targets":3},{"name":"Evolution.x","targets":4},{"name":"2023 - visiteurs","targets":5},{"name":"2024 - visiteurs","targets":6},{"name":"Evolution.y","targets":7},{"name":"2023 - RDV pour 1000 visites","targets":8},{"name":"2024 - RDV pour 1000 visites","targets":9},{"name":"Evolution_rdv_pour_1000_visites","targets":10}],"order":[],"autoWidth":false,"orderClasses":false}},"evals":[],"jsHooks":[]}</script>
```

# G2GML

G2GML: Semantic Graph to Property Graph Mapping Language

# Example of G2GML

```
PREFIX icgc: <http://icgc.link/vocab/>
PREFIX icgc-class: <http://icgc.link/>
PREFIX faldo: <http://biohackathon.org/resource/faldo>

nodes:
  donor:
    type:   S rdf:type icgc-class:Donor
    label:  S rdfs:label O
    age:    S icgc:age_at_diagnosis O
    gender: S icgc:sex O
  mutation:
    type:   S rdf:type icgc-class:Mutation
    start_position:
      S faldo:region ?r . ?r faldo:begin ?b . ?b faldo:position O

edges:
  has_mutation (donor, mutation):
    ?det icgc:donor ?donor . ?det icgc:mutation ?mutation
  affects(mutation, effect):
    ?mutation ^icgc:mutation ?effect . ?effect icgc:gene_affected ?gene
```
